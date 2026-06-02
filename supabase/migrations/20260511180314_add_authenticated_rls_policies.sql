/*
  # Add RLS policies for authenticated role

  The app may run with a Supabase auth session in localStorage (authenticated role).
  Add permissive policies for authenticated users as well so INSERT/UPDATE/SELECT/DELETE
  work regardless of auth state.
*/

DROP POLICY IF EXISTS "Authenticated can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated can delete transactions" ON public.transactions;

CREATE POLICY "Authenticated can insert transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can view transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete transactions"
  ON public.transactions FOR DELETE TO authenticated
  USING (true);
