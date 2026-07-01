-- Migration: create admin_audit table
-- Run this in Supabase SQL editor or via psql with service role key

CREATE TABLE IF NOT EXISTS public.admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor uuid REFERENCES profiles(id) ON DELETE SET NULL,
  target uuid,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_actor_idx ON public.admin_audit (actor);
CREATE INDEX IF NOT EXISTS admin_audit_target_idx ON public.admin_audit (target);
