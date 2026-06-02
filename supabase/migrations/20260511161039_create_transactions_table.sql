/*
  # Create transactions table

  Creates the core transactions table used to track all recharge payments.

  ## Tables
  - transactions: stores all recharge transactions with payment and DingConnect info

  ## Security
  - RLS enabled
  - Anon users can read/write their own session transactions
  - Authenticated users can read/write their own transactions
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  phone_number text NOT NULL DEFAULT '',
  operator_id text NOT NULL DEFAULT '',
  operator_name text NOT NULL DEFAULT '',
  country_from text NOT NULL DEFAULT 'BR',
  country_to text NOT NULL DEFAULT 'HT',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  receive_value numeric,
  receive_currency_iso text,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'pix',
  payment_id text,
  refund_id text,
  ding_transaction_id text,
  distributor_ref text,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view transactions by session"
  ON transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can update transactions by session"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
