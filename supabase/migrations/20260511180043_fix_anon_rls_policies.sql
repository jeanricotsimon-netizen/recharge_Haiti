/*
  # Fix RLS policies for anon access

  The app runs without authentication (anon role only).
  Previous migrations added authenticated-only policies that block anon inserts.
  This migration drops all conflicting policies and sets clean anon-only policies.
*/

-- Drop all existing policies on transactions
DROP POLICY IF EXISTS "Authenticated users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anon can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anon can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anon can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Anon can delete transactions" ON public.transactions;

-- Re-create clean anon policies
CREATE POLICY "Anon can insert transactions"
  ON public.transactions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view all transactions"
  ON public.transactions FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can update transactions"
  ON public.transactions FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete transactions"
  ON public.transactions FOR DELETE TO anon
  USING (true);
