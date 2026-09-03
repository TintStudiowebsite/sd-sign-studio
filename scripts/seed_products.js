import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

// ── Cloudinary config ───────────────────────────────────────────────────────
function readCloudinaryConfig() {
  if (!process.env.CLOUDINARY_URL) throw new Error('CLOUDINARY_URL missing from .env')
  const parsed = new URL(process.env.CLOUDINARY_URL)
  return {
    cloudName: parsed.hostname,
    apiKey: parsed.username,
    apiSecret: parsed.password,
  }
}

// ── Signed upload to Cloudinary ─────────────────────────────────────────────
async function uploadToCloudinary(filePath, folder) {
  const { cloudName, apiKey, apiSecret } = readCloudinaryConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex')

  const fileBuffer = fs.readFileSync(filePath)
  const blob = new Blob([fileBuffer])

  const fd = new FormData()
  fd.append('file', blob, path.basename(filePath))
  fd.append('folder', folder)
  fd.append('timestamp', timestamp.toString())
  fd.append('api_key', apiKey)
  fd.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Cloudinary upload failed (${res.status}): ${body}`)
  }
  const data = await res.json()
  return data.secure_url
}

// ── Parse folder name → { productName, priceInr } ──────────────────────────
function parseFolderName(folderName) {
  // Examples (the "Rs" token is messy in the source folders):
  //   "3 SERIES_Rs.25000"    → { name: "3 SERIES", price: 25000 }
  //   "A4_Rs .27500"         → { name: "A4",       price: 27500 }  (stray space)
  //   "CRETA AT Rs. 11000"   → { name: "CRETA AT", price: 11000 }
  //   "SCORPIO N EPB RS.17500" → { name: "SCORPIO N EPB", price: 17500 }
  //   "VOLVO XC60"           → { name: "VOLVO XC60", price: 0 }
  //
  // Strategy: find a trailing "...Rs<any punctuation/space>NUMBER" chunk and
  // strip it. Everything before it is the model name.
  const match = folderName.match(/^(.*?)[\s_]*(?:Rs|RS)[\s.]*(\d[\d,]*)\s*$/i)
  if (match) {
    return {
      name: cleanName(match[1]),
      priceInr: parseInt(match[2].replace(/,/g, ''), 10),
    }
  }

  // No price found – just use the name
  return { name: cleanName(folderName), priceInr: 0 }
}

// Trim separators/brackets left over after stripping the price token
function cleanName(raw) {
  return raw
    .replace(/[\s_]+/g, ' ')
    .replace(/[\s_-]+$/, '')
    .trim()
}

// ── Title Case helper ───────────────────────────────────────────────────────
// Keeps model-code tokens uppercase (contain a digit, or short all-caps like
// AT / MT / EV / SX / GT / iX), title-cases ordinary words.
function titleCase(str) {
  const fixWord = w => {
    if (!w) return w
    if (/\d/.test(w)) return w.toUpperCase()                     // 3XO, XUV700, EV6
    if (/[a-z]/.test(w) && /[A-Z]/.test(w)) return w             // already mixed: iX
    if (w.length <= 3 && w === w.toUpperCase()) return w         // AT, MT, EV, CLA, AMG
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  }
  return str
    .replace(/[[\]]/g, '')                                        // drop [ ] around trims
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.split('-').map(fixWord).join('-'))                // F-PACE → F-Pace
    .join(' ')
}

// ── Brand name normalisation ────────────────────────────────────────────────
// Values MUST match the `categories.name` rows already in Supabase so products
// attach to the existing brand categories instead of creating duplicates.
function normaliseBrand(raw) {
  const map = {
    'MERCEDES BENZ': 'Mercedes Benz',
    'LAND ROVER': 'Land Rover',
    'MARUTI SUZUKI': 'Maruti Suzuki',
    'BMW': 'BMW',
    'BYD': 'BYD',
    'MG': 'MG',
    'KIA': 'Kia',
  }
  return map[raw] || titleCase(raw)
}

// Drop a leading brand word that is repeated inside the folder name
// e.g. brand "Bentley" + folder "BENTLEY CONTINENTAL GT" → "Continental GT"
function stripBrandPrefix(modelName, brandName) {
  const b = brandName.toLowerCase()
  const m = modelName.toLowerCase()
  if (m === b) return modelName
  if (m.startsWith(b + ' ')) return modelName.slice(brandName.length).trim()
  return modelName
}

// ── Scan catalog folder ─────────────────────────────────────────────────────
function scanCatalog(catalogPath) {
  const products = []
  const brands = fs.readdirSync(catalogPath, { withFileTypes: true }).filter(d => d.isDirectory())

  for (const brandDir of brands) {
    const brandPath = path.join(catalogPath, brandDir.name)
    const brandName = normaliseBrand(brandDir.name)
    const productDirs = fs.readdirSync(brandPath, { withFileTypes: true }).filter(d => d.isDirectory())

    for (const prodDir of productDirs) {
      const prodPath = path.join(brandPath, prodDir.name)
      const files = fs.readdirSync(prodPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))

      if (files.length === 0) continue

      const { name, priceInr } = parseFolderName(prodDir.name)
      const model = titleCase(stripBrandPrefix(name, brandName))
      const fullName = `${brandName} ${model}`.trim()
      products.push({
        brand: brandName,
        modelName: model,
        fullName,
        priceInr,
        priceGbp: Math.round((priceInr / 100) * 100) / 100, // business rule: GBP = INR / 100
        imagePath: path.join(prodPath, files[0]),
        shortDesc: `Premium PPF protection kit for ${fullName}.`,
      })
    }
  }

  return products
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  SD Sign Studio — Product Catalog Seeder')
  console.log('═══════════════════════════════════════════════════\n')

  // Scan catalog
  const catalogPath = path.join(__dirname, '..', 'Product Catalog')
  if (!fs.existsSync(catalogPath)) throw new Error('Product Catalog folder not found')

  const products = scanCatalog(catalogPath)
  console.log(`Found ${products.length} products across ${[...new Set(products.map(p => p.brand))].length} brands\n`)

  // --dry-run: show what would be seeded, touch nothing
  if (process.argv.includes('--dry-run')) {
    console.log('── DRY RUN — parsed catalog (no uploads, no DB writes) ──')
    for (const p of products) {
      console.log(`  ${p.fullName.padEnd(38)} | ${p.brand.padEnd(15)} | ₹${p.priceInr || 'MISSING'}`)
    }
    const missing = products.filter(p => !p.priceInr)
    if (missing.length) {
      console.log(`\n  ⚠ ${missing.length} product(s) have no price in the folder name:`)
      missing.forEach(p => console.log(`     - ${p.fullName}`))
    }
    return
  }

  // Supabase setup
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.VITE_ADMIN_EMAIL,
    password: process.env.VITE_ADMIN_PASSWORD,
  })
  if (authError) throw new Error('Auth failed: ' + authError.message)
  console.log('✓ Authenticated with Supabase\n')

  // Ensure categories exist
  const uniqueBrands = [...new Set(products.map(p => p.brand))]
  console.log('── Ensuring brand categories exist ──')
  const { data: existingCats } = await supabase.from('categories').select('*')
  // Case-insensitive lookup so "BMW" in the catalog matches an existing "BMW"/"bmw"
  const catByName = new Map((existingCats || []).map(c => [c.name.toLowerCase(), c]))
  // New brand categories are nested under the same parent the existing ones use
  const BRAND_PARENT = 'Car Interiors PPF'
  const brandParentId = (existingCats || []).find(c => c.name === BRAND_PARENT)?.id || null

  for (const brand of uniqueBrands) {
    if (!catByName.has(brand.toLowerCase())) {
      const { error } = await supabase.from('categories').insert({ name: brand, parent_id: brandParentId })
      if (error) {
        console.log(`  ✗ Failed to create category "${brand}": ${error.message}`)
      } else {
        console.log(`  + Created category: ${brand}`)
      }
    } else {
      console.log(`  ✓ Category exists: ${brand}`)
    }
  }
  console.log()

  // Clear existing products
  console.log('── Clearing existing products ──')
  await supabase.from('product_images').delete().neq('id', 0)
  await supabase.from('products').delete().neq('id', 0)
  console.log('  ✓ Cleared existing products and images\n')

  // Upload & insert
  console.log('── Uploading images & inserting products ──')
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const progress = `[${i + 1}/${products.length}]`

    try {
      // Upload to Cloudinary
      const folder = `sd-sign-studio/products/${p.brand.toLowerCase().replace(/\s+/g, '-')}`
      const imageUrl = await uploadToCloudinary(p.imagePath, folder)

      // Insert into Supabase
      const { error } = await supabase.from('products').insert({
        name: p.fullName,
        category: p.brand,
        price: p.priceGbp,
        price_inr: p.priceInr,
        price_gbp: p.priceGbp,
        primary_image: imageUrl,
        short_description: p.shortDesc,
        badge: null,
      })

      if (error) throw error
      successCount++
      console.log(`  ${progress} ✓ ${p.fullName} (₹${p.priceInr}) → uploaded`)
    } catch (err) {
      failCount++
      console.log(`  ${progress} ✗ ${p.fullName}: ${err.message}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log(`  Done!  ✓ ${successCount} uploaded   ✗ ${failCount} failed`)
  console.log('═══════════════════════════════════════════════════\n')
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
