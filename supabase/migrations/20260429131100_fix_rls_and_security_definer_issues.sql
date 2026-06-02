/*
  # Fix RLS and Security Definer Issues

  1. RLS Policy Fixes
    - Drop overly permissive INSERT policy on `transactions` that uses `WITH CHECK (true)`
    - Drop overly permissive UPDATE policy on `transactions` that uses `USING (true) WITH CHECK (true)`
    - Replace both with restricted policies that only allow access to authenticated users for their own data

  2. Security Definer Fix
    - Revoke EXECUTE on `update_updated_at_column()` from `anon` and `authenticated` roles
    - This function is a trigger function and should not be callable via RPC
*/

-- Drop the insecure INSERT policy
DROP POLICY IF EXISTS "Demo users can insert transactions" ON public.transactions;

-- Drop the insecure UPDATE policy
DROP POLICY IF EXISTS "Demo users can update transactions" ON public.transactions;

-- Create a secure INSERT policy: only authenticated users can insert their own transactions
CREATE POLICY "Authenticated users can insert own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create a secure UPDATE policy: only authenticated users can update their own transactions
CREATE POLICY "Authenticated users can update own transactions"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revoke EXECUTE on the trigger function from anon and authenticated roles
-- This function should only be invoked by triggers, not via RPC
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
