import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_SUPABASE_URL ||  process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

const COMMON_MAIL = process.env.NEXT_COMMON_MAIL_ADDRESS

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null

async function verifyDevCredentials(devEmail, devPassword) {
  // Use Supabase Auth token endpoint to validate developer credentials
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ email: devEmail, password: devPassword }),
  })

  if (!res.ok) return null
  const body = await res.json()
  // body should contain access_token and user
  return body.user || null
}

export async function POST(request) {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Server supabase not configured' }), { status: 500 })
  }

  try {
    const body = await request.json()
    const { id, status, operatorEmail, devEmail, devPassword } = body || {}
    if (!id || !status || !operatorEmail) {
      return new Response(JSON.stringify({ error: 'Missing id, status or operatorEmail' }), { status: 400 })
    }

    // If operator is the common address, require developer credentials
    if (COMMON_MAIL && operatorEmail === COMMON_MAIL) {
      if (!devEmail || !devPassword) {
        return new Response(JSON.stringify({ needsDevCredentials: true }), { status: 200 })
      }

      const user = await verifyDevCredentials(devEmail, devPassword)
      if (!user) {
        return new Response(JSON.stringify({ error: 'Developer credentials invalid' }), { status: 403 })
      }

      const pic = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || user.email

      const { data, error } = await supabase
        .from('expert_requests')
        .update({ status, pic })
        .eq('id', id)
        .select()
        .single()

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      return new Response(JSON.stringify(data), { status: 200 })
    }

    // Otherwise check dev_account table for operatorEmail
    const { data: devs, error: devError } = await supabase.from('dev_account').select('mail').eq('mail', operatorEmail).limit(1)
    if (devError) return new Response(JSON.stringify({ error: devError.message }), { status: 500 })
    if (!devs || devs.length === 0) {
      return new Response(JSON.stringify({ error: 'Operator not allowed' }), { status: 403 })
    }

    // Try to fetch operator user info from auth admin to get display name
    let pic = operatorEmail
    try {
      if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.listUsers === 'function') {
        const list = await supabase.auth.admin.listUsers({ search: operatorEmail })
        const user = list?.data?.[0]
        if (user) pic = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || user.email
      }
    } catch (e) {
      // ignore and fallback to email
    }

    const { data, error } = await supabase
      .from('expert_requests')
      .update({ status, pic })
      .eq('id', id)
      .select()
      .single()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
