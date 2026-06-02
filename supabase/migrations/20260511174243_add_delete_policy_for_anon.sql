/*
  # Add DELETE policy for anon users on transactions

  Allows the app (running as anon) to delete transactions directly.
  This is an admin-facing app where the owner manages all transactions.
*/

CREATE POLICY "Anon can delete transactions"
  ON transactions
  FOR DELETE
  TO anon
  USING (true);
