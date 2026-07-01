import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase-config'

const bodySchema = z.object({ userId: z.string().min(1) })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = bodySchema.parse(json)

    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profiles, error: pError } = await supabase.from('profiles').select('role').eq('id', user.id).limit(1).single()
    if (pError || !profiles || profiles.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRole) return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
    const svc = createClient(SUPABASE_URL, serviceRole, { auth: { persistSession: false } })

    const { adminLimiter } = await import('@/lib/rate-limiter')
    const rl = await adminLimiter.take(user.id)
    if (rl.remaining < 0) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs || 0)/1000)) } })
    }

    const { error } = await svc.from('profiles').update({ role: 'user' }).eq('id', parsed.userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await svc.from('admin_audit').insert([{ action: 'demote_user', actor: user.id, target: parsed.userId, created_at: new Date().toISOString() }])

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 400 })
  }
}
