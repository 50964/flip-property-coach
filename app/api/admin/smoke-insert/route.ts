import { NextResponse } from 'next/server'
import { SUPABASE_URL } from '@/lib/supabase-config'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return NextResponse.json({ ok: false, error: 'Service role key not configured' }, { status: 500 })

  const svc = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } })
  const { data, error } = await svc.from('admin_audit').insert([{ action: 'smoke_test_insert', meta: { by: 'smoke-endpoint' } }])
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
