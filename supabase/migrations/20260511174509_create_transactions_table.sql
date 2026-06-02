/*
  # Create transactions table for recharge history

  ## New Table: transactions
  - id: UUID primary key
  - session_id: text — anonymous session identifier (stored in localStorage)
  - user_id: uuid — nullable, for authenticated users
  - phone_number: text — destination phone number
  - operator_id: text — operator code (e.g. HaitiNatcom, DigicelHT)
  - operator_name: text — human-readable operator name
  - country_from: text — origin country code (BR, US, etc.)
  - country_to: text — destination country code (HT, DO, etc.)
  - amount: numeric — amount paid by customer
  - currency: text — payment currency (BRL, USD, etc.)
  - receive_value: numeric — amount received on destination
  - receive_currency_iso: text — destination currency
  - status: text — pending | success | failed | refunded
  - payment_method: text — PIX | PayPal | etc.
  - payment_id: text — external payment provider ID
  - refund_id: text — refund reference if applicable
  - ding_transaction_id: text — DingConnect transaction ID
  - distributor_ref: text — distributor reference
  - failure_reason: text — error message if failed
  - created_at: timestamptz
  - updated_at: timestamptz

  ## Security
  - RLS enabled
  - anon can INSERT, SELECT, UPDATE, DELETE (app runs as anon — no auth)
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid,
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
  payment_method text NOT NULL DEFAULT 'PIX',
  payment_id text,
  refund_id text,
  ding_transaction_id text,
  distributor_ref text,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert transactions"
  ON transactions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can view all transactions"
  ON transactions FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can update transactions"
  ON transactions FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete transactions"
  ON transactions FOR DELETE TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
