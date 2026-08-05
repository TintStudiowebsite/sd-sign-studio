import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(scriptDirectory, '..', '.env') })

const requiredEnvironment = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'DATABASE_URL',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
]

const missingEnvironment = requiredEnvironment.filter(key => !process.env[key])
if (missingEnvironment.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvironment.join(', ')}`)
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  const { error: signUpError } = await supabase.auth.signUp({ email, password })
  if (signUpError && !signUpError.message.includes('User already registered')) {
    throw new Error(`Admin sign-up failed: ${signUpError.message}`)
  }

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (loginError) {
    throw new Error(`Admin sign-in failed: ${loginError.message}`)
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    await client.query(`
      insert into public.user_roles (user_id, role)
      values ($1, 'admin')
      on conflict (user_id) do update set role = 'admin'
    `, [loginData.user.id])
  } finally {
    await client.end()
  }

  console.log('Administrator account and role are ready')
}

createAdmin().catch(error => {
  console.error('Failed to create administrator:', error)
  process.exit(1)
})
