/*
  # Complete Database Schema

  Creates the full schema for the international recharge platform.
  
  Tables:
  - transactions: Core recharge transaction records
  - admin_config: Admin PIN configuration
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid,
  session_id            uuid,
  phone_number          text NOT NULL DEFAULT '',
  operator_id           text NOT NULL DEFAULT '',
  operator_name         text NOT NULL DEFAULT '',
  amount                numeric NOT NULL DEFAULT 0,
  currency              text NOT NULL DEFAULT 'BRL',
  currency_symbol       text NOT NULL DEFAULT 'R$',
  country_from          text NOT NULL DEFAULT 'BR',
  country_to            text NOT NULL DEFAULT 'HT',
  receive_value         numeric,
  receive_currency_iso  text,
  payment_id            text,
  payment_method        text NOT NULL DEFAULT 'pix',
  refund_id             text,
  ding_transaction_id   text,
  distributor_ref       text,
  status                text NOT NULL DEFAULT 'pending',
  failure_reason        text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_phone_number       ON transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status             ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at         ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id         ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ding_transaction_id ON transactions(ding_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id            ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id         ON transactions(session_id);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon users can view transactions" ON transactions;
CREATE POLICY "Anon users can view transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Anon users can insert transactions" ON transactions;
CREATE POLICY "Anon users can insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon users can update transactions" ON transactions;
CREATE POLICY "Anon users can update transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view own transactions" ON transactions;
CREATE POLICY "Authenticated users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own transactions" ON transactions;
CREATE POLICY "Authenticated users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can update own transactions" ON transactions;
CREATE POLICY "Authenticated users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ADMIN CONFIG TABLE
CREATE TABLE IF NOT EXISTS admin_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct SELECT on admin_config" ON admin_config;
CREATE POLICY "No direct SELECT on admin_config"
  ON admin_config FOR SELECT
  TO anon, authenticated
  USING (false);

DROP POLICY IF EXISTS "No direct INSERT on admin_config" ON admin_config;
CREATE POLICY "No direct INSERT on admin_config"
  ON admin_config FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "No direct UPDATE on admin_config" ON admin_config;
CREATE POLICY "No direct UPDATE on admin_config"
  ON admin_config FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "No direct DELETE on admin_config" ON admin_config;
CREATE POLICY "No direct DELETE on admin_config"
  ON admin_config FOR DELETE
  TO anon, authenticated
  USING (false);

-- ADMIN PIN FUNCTIONS
CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash FROM admin_config LIMIT 1;
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  RETURN (extensions.crypt(input_pin, stored_hash) = stored_hash);
END;
$$;

CREATE OR REPLACE FUNCTION set_admin_pin(new_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  DELETE FROM admin_config WHERE id IS NOT NULL;
  INSERT INTO admin_config (pin_hash)
  VALUES (extensions.crypt(new_pin, extensions.gen_salt('bf')));
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_admin_pin(text)    FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.verify_admin_pin(text) TO service_role;
GRANT  EXECUTE ON FUNCTION public.set_admin_pin(text)    TO service_role;

-- SEED INITIAL ADMIN PIN
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_config LIMIT 1) THEN
    PERFORM set_admin_pin('0330');
  END IF;
END $$;

-- Comments
COMMENT ON TABLE transactions IS 'International recharge transactions via DingConnect + MercadoPago';
COMMENT ON COLUMN transactions.ding_transaction_id IS 'TransferRef returned by DingConnect API';
COMMENT ON COLUMN transactions.distributor_ref IS 'Unique reference sent to DingConnect (DistributorRef)';
