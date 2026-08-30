import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => {
    const idx = l.indexOf('=')
    return [l.slice(0, idx), l.slice(idx + 1)]
  })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const { data, error } = await supabase.from('categories').select('*').order('name')
if (error) {
  console.log('ERROR:', JSON.stringify(error, null, 2))
} else {
  console.log('ROW COUNT:', data.length)
  console.log(JSON.stringify(data, null, 2))
}
