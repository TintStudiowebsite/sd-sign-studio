/**
 * Replace the image for specific services with the new artwork dropped in
 * ./services-replace/. Uploads each file to Cloudinary (same unsigned preset the
 * admin UI uses) and updates services.image for the matching row.
 *
 *   node scripts/replace_service_images.mjs            # dry run
 *   node scripts/replace_service_images.mjs --commit   # upload + write
 */
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
dotenv.config({ path: path.join(ROOT, '.env') })

const COMMIT = process.argv.includes('--commit')

// signed upload, same Cloudinary account the product seeder used (CLOUDINARY_URL)
const CLD = new URL(process.env.CLOUDINARY_URL)
const CLOUD = CLD.hostname
const API_KEY = CLD.username
const API_SECRET = CLD.password

// new file  ->  { title: exact services.title, localName: public/images/services/<x> }
const MAP = [
  { file: 'Shop-awnings.webp',                 title: 'Shop Awnings',              localName: 'shop-awnings.webp' },
  { file: 'custom-workwear.webp',              title: 'Custom Workwear',           localName: 'custom-workwear.webp' },
  { file: 'flyers-and-brochures.webp',         title: 'Flyers & Brochures',        localName: 'flyers-and-brochures.webp' },
  { file: 'Exhibition-stands-and-flags.webp',  title: 'Exhibition Stands & Flags', localName: 'exhibition-stands-and-flags.webp' },
  { file: 'menu-displays.webp',                title: 'Menu Displays',             localName: 'menu-displays.webp' },
  { file: 'Heras-fence-banenrs.webp',          title: 'Heras Fence Banners',       localName: 'heras-fence-banners.webp' },
]

async function uploadToCloudinary(filePath) {
  const folder = 'sd-sign-studio/services'
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto.createHash('sha1')
    .update(`folder=${folder}&timestamp=${timestamp}${API_SECRET}`).digest('hex')

  const buf = fs.readFileSync(filePath)
  const fd = new FormData()
  fd.append('file', new Blob([buf]), path.basename(filePath))
  fd.append('folder', folder)
  fd.append('timestamp', String(timestamp))
  fd.append('api_key', API_KEY)
  fd.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Cloudinary ${res.status}: ${await res.text()}`)
  return (await res.json()).secure_url
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const { rows: svc } = await client.query('select id, title, image from services')
const byTitle = new Map(svc.map(s => [s.title, s]))

// validate everything up front
const plan = []
for (const m of MAP) {
  const src = path.join(ROOT, 'services-replace', m.file)
  if (!fs.existsSync(src)) throw new Error(`missing file: ${src}`)
  const row = byTitle.get(m.title)
  if (!row) throw new Error(`no services row titled "${m.title}"`)
  plan.push({ ...m, src, row })
}

console.log('── plan ──')
for (const p of plan) {
  console.log(`  "${p.title}" (#${p.row.id})`)
  console.log(`     old: ${p.row.image}`)
  console.log(`     new: <- ${p.file}`)
}

const publicDir = path.join(ROOT, 'public', 'images', 'services')

if (!COMMIT) {
  console.log('\nDRY RUN — re-run with --commit to upload and update.')
  await client.end()
  process.exit(0)
}

fs.mkdirSync(publicDir, { recursive: true })
console.log('\n── uploading + updating ──')
for (const p of plan) {
  fs.copyFileSync(p.src, path.join(publicDir, p.localName))
  const url = await uploadToCloudinary(p.src)
  await client.query('update services set image = $1 where id = $2', [url, p.row.id])
  console.log(`  ✓ ${p.title}\n     ${url}`)
}

await client.end()
console.log('\nDone. Also updated public/images/services/. Update src/data/services.js manually if desired.')
