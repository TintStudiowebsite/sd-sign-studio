/**
 * One-time repair for the products that scripts/seed_products.js already
 * inserted (images are on Cloudinary; only the DB rows are wrong).
 *
 * Fixes, in place, WITHOUT re-uploading any image:
 *   1. products.category  "Bmw"/"Byd"/"Mg"  ->  "BMW"/"BYD"/"MG"
 *   2. removes the duplicate brand categories seed_products.js created
 *      ("Bmw", "Byd", "Mg" with parent_id = NULL)
 *   3. re-parses every catalog folder name and corrects
 *      products.name / price_inr / short_description
 *
 * Rows are matched to catalog folders by scan order (the folder iteration is
 * deterministic and the rows were inserted in that exact order). Every match is
 * validated (brand must line up) before anything is written.
 *
 * Usage:
 *   node scripts/fix_catalog_data.mjs              # dry run, shows every change
 *   node scripts/fix_catalog_data.mjs --commit     # apply
 *   node scripts/fix_catalog_data.mjs --commit --price "Mercedes Benz S Class=35000" --price "Volvo XC60=20000"
 */
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const COMMIT = process.argv.includes('--commit')

// prices supplied on the command line for folders that have none in their name
const priceOverrides = {}
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === '--price') {
    const [k, v] = (process.argv[i + 1] || '').split('=')
    if (k && v) priceOverrides[k.trim()] = parseInt(v, 10)
  }
}

// ── same parsing helpers as seed_products.js ────────────────────────────────
function parseFolderName(folderName) {
  const match = folderName.match(/^(.*?)[\s_]*(?:Rs|RS)[\s.]*(\d[\d,]*)\s*$/i)
  if (match) return { name: cleanName(match[1]), priceInr: parseInt(match[2].replace(/,/g, ''), 10) }
  return { name: cleanName(folderName), priceInr: 0 }
}
function cleanName(raw) {
  return raw.replace(/[\s_]+/g, ' ').replace(/[\s_-]+$/, '').trim()
}
function titleCase(str) {
  const fixWord = w => {
    if (!w) return w
    if (/\d/.test(w)) return w.toUpperCase()
    if (/[a-z]/.test(w) && /[A-Z]/.test(w)) return w
    if (w.length <= 3 && w === w.toUpperCase()) return w
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  }
  return str
    .replace(/[[\]]/g, '')
    .split(/\s+/).filter(Boolean)
    .map(w => w.split('-').map(fixWord).join('-'))
    .join(' ')
}
function normaliseBrand(raw) {
  const map = {
    'MERCEDES BENZ': 'Mercedes Benz', 'LAND ROVER': 'Land Rover', 'MARUTI SUZUKI': 'Maruti Suzuki',
    'BMW': 'BMW', 'BYD': 'BYD', 'MG': 'MG', 'KIA': 'Kia',
  }
  return map[raw] || titleCase(raw)
}
function stripBrandPrefix(modelName, brandName) {
  const b = brandName.toLowerCase(), m = modelName.toLowerCase()
  if (m === b) return modelName
  if (m.startsWith(b + ' ')) return modelName.slice(brandName.length).trim()
  return modelName
}

function scanCatalog(catalogPath) {
  const out = []
  const brands = fs.readdirSync(catalogPath, { withFileTypes: true }).filter(d => d.isDirectory())
  for (const brandDir of brands) {
    const brandPath = path.join(catalogPath, brandDir.name)
    const brandName = normaliseBrand(brandDir.name)
    const productDirs = fs.readdirSync(brandPath, { withFileTypes: true }).filter(d => d.isDirectory())
    for (const prodDir of productDirs) {
      const prodPath = path.join(brandPath, prodDir.name)
      const files = fs.readdirSync(prodPath).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      if (files.length === 0) continue
      let { name, priceInr } = parseFolderName(prodDir.name)
      const model = titleCase(stripBrandPrefix(name, brandName))
      const fullName = `${brandName} ${model}`.trim()
      if (!priceInr && priceOverrides[fullName]) priceInr = priceOverrides[fullName]
      out.push({
        brand: brandName,
        fullName,
        priceInr,
        shortDesc: `Premium PPF protection kit for ${fullName}.`,
      })
    }
  }
  return out
}

const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '')
const brandKey = b => norm(b)

// ── main ────────────────────────────────────────────────────────────────────
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const catalogPath = path.join(__dirname, '..', 'Product Catalog')
const scanned = scanCatalog(catalogPath)

const { rows: dbRows } = await client.query(
  `select id, name, category, price_inr, price_gbp, price, primary_image
     from products
    where primary_image like '%res.cloudinary.com/hpdgdpxp%'
    order by id`
)

// GBP price = INR price / 100 (per business rule)
const gbpFromInr = inr => Math.round((Number(inr) / 100) * 100) / 100

console.log(`Catalog folders: ${scanned.length}   |   DB rows (from this Cloudinary account): ${dbRows.length}\n`)

if (scanned.length !== dbRows.length) {
  console.error('✗ Count mismatch — cannot safely match by order. Aborting.')
  await client.end()
  process.exit(1)
}

// validate order-based pairing: brand of the folder must be recognisable in the old row
const pairs = []
const badPairs = []
for (let i = 0; i < scanned.length; i++) {
  const s = scanned[i], d = dbRows[i]
  const oldName = norm(d.name)
  const oldCat = norm(d.category || '')
  const bk = brandKey(s.brand)
  // brand appears in old name, OR old category is the same brand (any case), OR
  // old category is the mangled title-case variant (bmw/byd/mg)
  const ok = oldName.includes(bk) || oldCat === bk
  ;(ok ? pairs : badPairs).push({ s, d })
}

if (badPairs.length) {
  console.error(`✗ ${badPairs.length} row(s) could not be confidently matched by order:`)
  for (const { s, d } of badPairs) console.error(`   folder "${s.fullName}"  <->  db #${d.id} "${d.name}" (${d.category})`)
  console.error('\nAborting without changes. Inspect manually.')
  await client.end()
  process.exit(1)
}

// build the change set
const catFix = { Bmw: 'BMW', Byd: 'BYD', Mg: 'MG' }
const updates = []
for (const { s, d } of pairs) {
  const newCat = catFix[d.category] || s.brand
  const newInr = s.priceInr
  const newGbp = gbpFromInr(newInr)
  const changes = {}
  if (d.name !== s.fullName) changes.name = s.fullName
  if (newCat !== d.category) changes.category = newCat
  if (Number(d.price_inr) !== Number(newInr)) changes.price_inr = newInr
  if (Number(d.price_gbp) !== newGbp) changes.price_gbp = newGbp
  if (Number(d.price) !== newGbp) changes.price = newGbp
  if (Object.keys(changes).length) updates.push({ id: d.id, old: d, changes, shortDesc: s.shortDesc })
}

console.log(`── ${updates.length} product row(s) need changes ──`)
for (const u of updates) {
  const bits = Object.entries(u.changes).map(([k, v]) => `${k}: ${JSON.stringify(u.old[k])} → ${JSON.stringify(v)}`)
  console.log(`  #${u.id}  ${u.old.name}\n       ${bits.join('\n       ')}`)
}

const stillMissing = pairs.filter(p => !p.s.priceInr).map(p => p.s.fullName)
if (stillMissing.length) {
  console.log(`\n⚠ still no price (pass --price "<full name>=<inr>"):`)
  stillMissing.forEach(n => console.log(`   - ${n}`))
}

// duplicate categories to remove
const { rows: dupCats } = await client.query(
  `select id, name from categories where name in ('Bmw','Byd','Mg') and parent_id is null order by name`
)
console.log(`\n── duplicate categories to delete ── ${dupCats.map(c => `#${c.id} ${c.name}`).join(', ') || '(none)'}`)

if (!COMMIT) {
  console.log('\nDRY RUN — nothing written. Re-run with --commit to apply.')
  await client.end()
  process.exit(0)
}

// ── apply ───────────────────────────────────────────────────────────────────
console.log('\n── applying ──')
await client.query('BEGIN')
try {
  for (const u of updates) {
    const sets = []
    const vals = []
    let n = 1
    for (const [k, v] of Object.entries(u.changes)) { sets.push(`${k} = $${n++}`); vals.push(v) }
    sets.push(`short_description = $${n++}`); vals.push(u.shortDesc)
    vals.push(u.id)
    await client.query(`update products set ${sets.join(', ')} where id = $${n}`, vals)
  }
  // any remaining products still pointing at the old category names
  await client.query(`update products set category = 'BMW' where category = 'Bmw'`)
  await client.query(`update products set category = 'BYD' where category = 'Byd'`)
  await client.query(`update products set category = 'MG'  where category = 'Mg'`)
  if (dupCats.length) {
    await client.query(`delete from categories where id = any($1)`, [dupCats.map(c => c.id)])
  }
  await client.query('COMMIT')
  console.log(`✓ updated ${updates.length} products, deleted ${dupCats.length} duplicate categories`)
} catch (e) {
  await client.query('ROLLBACK')
  console.error('✗ rolled back:', e.message)
  process.exitCode = 1
}
await client.end()
