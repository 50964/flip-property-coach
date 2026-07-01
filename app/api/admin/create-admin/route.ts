import { NextResponse } from 'next/server'
import { SUPABASE_URL } from '@/lib/supabase-config'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ ok: false, error: 'missing email or password' }, { status: 400 })

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return NextResponse.json({ ok: false, error: 'service key missing' }, { status: 500 })

    const svc = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } })

    // Create user via admin API
    // Use admin.createUser available on service role client
    // @ts-ignore
    const { data: user, error: createErr } = await svc.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) return NextResponse.json({ ok: false, error: createErr.message }, { status: 500 })

    // Insert or upsert profile with admin role
    const { error: profileErr } = await svc.from('profiles').upsert({ id: user.id, email: email, role: 'admin' }, { onConflict: 'id' })
    if (profileErr) return NextResponse.json({ ok: false, error: profileErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, user_id: user.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? String(e) }, { status: 500 })
  }
}
