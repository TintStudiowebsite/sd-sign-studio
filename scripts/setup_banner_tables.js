import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pg from 'pg'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.join(scriptDirectory, '..')
const migrationPath = path.join(
  projectDirectory,
  'supabase',
  'migrations',
  '202608050001_create_home_banners.sql'
)

dotenv.config({ path: path.join(projectDirectory, '.env') })

async function setupBannerTables() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is missing from .env')
  }

  const client = new pg.Client({ connectionString })

  try {
    await client.connect()
    const migration = await fs.readFile(migrationPath, 'utf8')
    await client.query(migration)
    console.log('Home banner tables, policies, and publish function are ready')
  } finally {
    await client.end()
  }
}

setupBannerTables().catch(error => {
  console.error('Failed to set up home banner storage:', error)
  process.exit(1)
})
