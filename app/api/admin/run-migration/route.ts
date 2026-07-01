import { NextResponse } from 'next/server'
import { SUPABASE_URL } from '@/lib/supabase-config'
import { createClient } from '@supabase/supabase-js'

const SQL = `
-- Create table
CREATE TABLE IF NOT EXISTS public.admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target uuid,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

-- Create policy allowing service role full access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admin_audit_service_role_policy') THEN
    EXECUTE $$
      CREATE POLICY admin_audit_service_role_policy ON public.admin_audit
      FOR ALL
      USING ( auth.role() = 'service_role' );
    $$;
  END IF;
END$$;

-- Service-role-only policy (avoid referencing profiles table)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admin_audit_service_role_policy') THEN
    EXECUTE $$
      CREATE POLICY admin_audit_service_role_policy ON public.admin_audit
      FOR ALL
      USING ( auth.role() = 'service_role' );
    $$;
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS admin_audit_actor_idx ON public.admin_audit (actor);
CREATE INDEX IF NOT EXISTS admin_audit_target_idx ON public.admin_audit (target);
`

export async function POST() {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) return NextResponse.json({ ok: false, error: 'Service role key not configured' }, { status: 500 })

    // Use Supabase Postgres REST endpoint to run SQL using service role
    const sqlEndpoint = `${SUPABASE_URL}/rest/v1/rpc` // Note: using rest/v1/rpc with SQL body

    const resp = await fetch(sqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sql',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: SQL,
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      return NextResponse.json({ ok: false, status: resp.status, body: text }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
