import { createClient } from '@supabase/supabase-js'

// Prefer `NEXT_PUBLIC_SUPABASE_*` env vars, fall back to other common names
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase env vars missing for server API: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

export async function GET() {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server supabase config missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { data, error } = await supabase
      .from('expert_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}

export async function PATCH(request) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server supabase config missing (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const body = await request.json()
    const { id, status } = body || {}
    if (!id || !status) return new Response(JSON.stringify({ error: 'Missing id or status' }), { status: 400 })

    const { data, error } = await supabase
      .from('expert_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

    return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
