import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_SUPABASE_URL ||  process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

// POST { email }
// Returns { allowed: true } if email exists in dev_account, otherwise { allowed: false }
export async function POST(request) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server supabase not configured' }), { status: 500 })
  }

  try {
    const body = await request.json()
    const { email } = body || {}
    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 })

    // Check dev_account for the email
    const { data, error } = await supabase.from('dev_account').select('mail').eq('mail', email).limit(1)
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    if (data && data.length > 0) {
      return new Response(JSON.stringify({ allowed: true }), { status: 200 })
    }

    return new Response(JSON.stringify({ allowed: false }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
