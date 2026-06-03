/*
  # Full Schema — Recharge Haiti

  ## Summary
  Creates the complete database schema for the international recharge platform.

  ## Tables

  ### transactions
  Core table storing every recharge attempt and its outcome.
  - id (uuid, primary key)
  - user_id (uuid, nullable — reserved for future auth)
  - session_id (uuid) — anonymous session identifier stored client-side
  - phone_number (text) — destination phone number
  - operator_id (text) — DingConnect SKU code (e.g. HT_D7_TopUp)
  - operator_name (text) — human-readable operator name
  - amount (numeric) — amount charged to the customer in their currency
  - currency (text) — payment currency (BRL, USD, etc.)
  - currency_symbol (text) — display symbol (R$, $)
  - country_from (text) — origin country code (BR)
  - country_to (text) — destination country code (HT, DO)
  - receive_value (numeric, nullable) — credit delivered to recipient
  - receive_currency_iso (text, nullable) — recipient credit currency (HTG, DOP)
  - payment_id (text, nullable) — MercadoPago payment ID
  - payment_method (text) — payment method (pix)
  - refund_id (text, nullable) — MercadoPago refund ID
  - ding_transaction_id (text, nullable) — DingConnect TransferRef
  - distributor_ref (text, nullable) — DistributorRef sent to DingConnect
  - status (text) — pending | processing | success | failed | refunded
  - failure_reason (text, nullable) — error details on failure
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### admin_config
  Single-row table storing bcrypt-hashed admin PIN for protected operations.
  - id (uuid, primary key)
  - pin_hash (text) — bcrypt hash
  - created_at / updated_at (timestamptz)

  ## Security
  - RLS enabled on both tables
  - anon role can SELECT/INSERT/UPDATE transactions (no auth required for demo)
  - DELETE on transactions requires PIN verification via service_role edge function
  - admin_config is fully blocked for anon/authenticated — service_role only
  - verify_admin_pin and set_admin_pin functions restricted to service_role

  ## Performance
  - Indexes on phone_number, status, created_at, payment_id, ding_transaction_id, user_id, session_id

  ## Notes
  - Admin PIN is set to '0330' on creation
*/

-- Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─────────────────────────────────────────
-- TRANSACTIONS TABLE
-- ─────────────────────────────────────────
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

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_phone_number       ON transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status             ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at         ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id         ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ding_transaction_id ON transactions(ding_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id            ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id         ON transactions(session_id);

-- Auto-update updated_at on row change
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

-- ─────────────────────────────────────────
-- ADMIN CONFIG TABLE
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_config (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Block all direct client access
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

-- ─────────────────────────────────────────
-- ADMIN PIN FUNCTIONS (service_role only)
-- ─────────────────────────────────────────
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

-- Restrict function execution to service_role only
REVOKE EXECUTE ON FUNCTION public.verify_admin_pin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_admin_pin(text)    FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.verify_admin_pin(text) TO service_role;
GRANT  EXECUTE ON FUNCTION public.set_admin_pin(text)    TO service_role;

-- ─────────────────────────────────────────
-- SEED: set initial admin PIN to '0330'
-- ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_config LIMIT 1) THEN
    PERFORM set_admin_pin('0330');
  END IF;
END $$;

-- Table comments
COMMENT ON TABLE  transactions                           IS 'International recharge transactions via DingConnect + MercadoPago';
COMMENT ON COLUMN transactions.ding_transaction_id       IS 'TransferRef returned by DingConnect API';
COMMENT ON COLUMN transactions.distributor_ref           IS 'Unique reference sent to DingConnect (DistributorRef)';
COMMENT ON COLUMN transactions.amount                    IS 'Amount charged to customer in their local currency';
COMMENT ON COLUMN transactions.receive_value             IS 'Credit amount delivered to recipient phone';
COMMENT ON COLUMN transactions.payment_id                IS 'MercadoPago payment ID';
COMMENT ON COLUMN transactions.refund_id                 IS 'MercadoPago refund ID if a refund was issued';
COMMENT ON COLUMN transactions.status                    IS 'pending | processing | success | failed | refunded';