/*
  # Harden security: fix SECURITY DEFINER function and confirm RLS policies

  1. Function Security
    - Switch update_updated_at_column() from SECURITY DEFINER to SECURITY INVOKER
      (it is a trigger function and needs no elevated privileges)
    - Explicitly revoke EXECUTE from anon and authenticated to be safe

  2. RLS Cleanup
    - Drop the always-true "Demo users can view transactions" SELECT policy for anon
      (anon should not have unrestricted read access to all transactions)
    - Confirm no always-true INSERT/UPDATE policies remain for anon
*/

-- Switch the trigger helper to SECURITY INVOKER so it runs as the calling user
-- and cannot be exploited as a privilege escalation vector via RPC
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;

-- Explicitly revoke RPC execution from public roles
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;

-- Drop the unrestricted anon SELECT policy (USING (true) exposes all rows to unauthenticated users)
DROP POLICY IF EXISTS "Demo users can view transactions" ON public.transactions;

-- Drop any residual always-true insert/update policies for anon just in case
DROP POLICY IF EXISTS "Demo users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Demo users can update transactions" ON public.transactions;
