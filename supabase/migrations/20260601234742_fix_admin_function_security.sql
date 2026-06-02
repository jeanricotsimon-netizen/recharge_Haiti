/*
  # Fix Admin Function Security Issues

  1. Problems fixed
    - Revoke EXECUTE on set_admin_pin and verify_admin_pin from anon and authenticated roles
    - Only service_role (edge functions) retains access
    - Add RLS policy on admin_config so no direct data access by anon/authenticated

  2. Security
    - set_admin_pin: only callable via service_role (edge functions with SUPABASE_SERVICE_ROLE_KEY)
    - verify_admin_pin: only callable via service_role
    - admin_config table: blocked for anon and authenticated via RLS policy
*/

-- Revoke EXECUTE from all public/anon/authenticated roles
REVOKE EXECUTE ON FUNCTION public.set_admin_pin(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_admin_pin(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_admin_pin(text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM authenticated;

-- Ensure service_role retains access
GRANT EXECUTE ON FUNCTION public.set_admin_pin(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(text) TO service_role;

-- Add RLS policy on admin_config: deny all direct access by anon/authenticated
-- (table already has RLS enabled but no policies — adding explicit deny-all via no SELECT policy)
-- service_role bypasses RLS by default, so admin operations still work through edge functions

CREATE POLICY "No direct access to admin config"
  ON public.admin_config
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "No insert to admin config by users"
  ON public.admin_config
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "No update to admin config by users"
  ON public.admin_config
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No delete to admin config by users"
  ON public.admin_config
  FOR DELETE
  TO anon, authenticated
  USING (false);
