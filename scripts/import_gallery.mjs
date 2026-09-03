/**
 * Fetch every image/video the user uploaded under the Cloudinary folder
 * "sd-sign-studio/gallery" and insert them into the `gallery` table.
 *
 * This account uses Cloudinary "dynamic folders", so an asset's folder lives in
 * `asset_folder` (not in its public_id) — we filter on that.
 *
 * Each row gets a RANDOM category from the site's gallery category list
 * (per request). media_type is taken from Cloudinary's resource_type.
 * Re-runnable: assets already in the table (matched by URL) are skipped.
 *
 *   node scripts/import_gallery.mjs            # dry run (shows what it will do)
 *   node scripts/import_gallery.mjs --commit   # insert rows
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import { DEFAULT_GALLERY_CATEGORIES } from '../src/data/galleryCategoriesService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const FOLDER = 'sd-sign-studio/gallery'
const COMMIT = process.argv.includes('--commit')
const CATEGORIES = DEFAULT_GALLERY_CATEGORIES.map(c => c.name)
const randomCategory = () => CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]

function cloudinary() {
  if (!process.env.CLOUDINARY_URL) throw new Error('CLOUDINARY_URL missing from .env')
  const u = new URL(process.env.CLOUDINARY_URL)
  return { cloud: u.hostname, auth: 'Basic ' + Buffer.from(`${u.username}:${u.password}`).toString('base64') }
}

async function listByFolder(resourceType) {
  const { cloud, auth } = cloudinary()
  const out = []
  let cursor = null
  do {
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloud}/resources/${resourceType}/upload`)
    url.searchParams.set('max_results', '500')
    if (cursor) url.searchParams.set('next_cursor', cursor)
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (!res.ok) throw new Error(`Cloudinary ${resourceType} list: ${res.status} ${await res.text()}`)
    const data = await res.json()
    for (const r of data.resources || []) {
      const folder = r.asset_folder || r.public_id.split('/').slice(0, -1).join('/')
      if (folder === FOLDER || folder.startsWith(FOLDER + '/')) out.push(r)
    }
    cursor = data.next_cursor || null
  } while (cursor)
  return out
}

async function main() {
  const [images, videos] = await Promise.all([listByFolder('image'), listByFolder('video')])
  const assets = [
    ...images.map(r => ({ ...r, mediaType: 'image' })),
    ...videos.map(r => ({ ...r, mediaType: 'video' })),
  ].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))

  console.log(`Cloudinary folder "${FOLDER}": ${images.length} images + ${videos.length} videos`)

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const { rows: existing } = await client.query('select image, media_url from gallery')
  const known = new Set(existing.flatMap(r => [r.image, r.media_url]).filter(Boolean))

  const perCat = {}
  const rows = []
  for (const a of assets) {
    if (known.has(a.secure_url)) continue
    const category = randomCategory()
    perCat[category] = (perCat[category] || 0) + 1
    rows.push({
      title: `${category} ${String(perCat[category]).padStart(2, '0')}`,
      category,
      image: a.secure_url,
      media_url: a.secure_url,
      media_type: a.mediaType,
    })
  }

  console.log(`\n${rows.length} new rows (${existing.length} already in table, skipped ${assets.length - rows.length})\n`)
  for (const r of rows) console.log(`  [${r.media_type}] ${r.category.padEnd(30)} ${r.media_url}`)
  console.log('\nby category:')
  for (const [c, n] of Object.entries(perCat).sort()) console.log(`  ${c.padEnd(30)} ${n}`)

  if (!COMMIT) {
    console.log('\nDRY RUN — nothing written. Re-run with --commit to insert.')
    await client.end()
    return
  }
  if (rows.length === 0) { console.log('Nothing to insert.'); await client.end(); return }

  const cols = ['title', 'category', 'image', 'media_url', 'media_type']
  const vals = []
  const tuples = rows.map((r, i) => {
    const b = i * cols.length
    vals.push(r.title, r.category, r.image, r.media_url, r.media_type)
    return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5})`
  })
  const { rowCount } = await client.query(
    `insert into gallery (${cols.join(',')}) values ${tuples.join(',')}`, vals
  )
  console.log(`\n✓ inserted ${rowCount} gallery rows`)
  await client.end()
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
