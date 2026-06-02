/*
  # Admin Config Table + Secure Delete Policy for Transactions

  ## Summary
  Creates a system where only someone knowing a secret PIN can delete transactions.

  ## New Tables
  - `admin_config`: stores a single row with a bcrypt-hashed admin PIN
    - `id` (uuid, primary key)
    - `pin_hash` (text): bcrypt hash of the admin PIN
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Changes to Transactions
  - Adds a DELETE policy that allows deletion only when the request includes
    the correct admin PIN via a database function check.

  ## Security
  - RLS enabled on admin_config (no direct access allowed)
  - A SECURITY DEFINER function `verify_admin_pin(text)` checks the PIN hash
    without exposing the hash to the client
  - DELETE on transactions requires verify_admin_pin to return true
*/

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin config table
CREATE TABLE IF NOT EXISTS admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- No direct SELECT/INSERT/UPDATE/DELETE allowed on admin_config from clients
-- Only the SECURITY DEFINER function below can access it

-- Function to verify admin PIN (runs as DB owner, not caller)
CREATE OR REPLACE FUNCTION verify_admin_pin(input_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT pin_hash INTO stored_hash FROM admin_config LIMIT 1;
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  RETURN (crypt(input_pin, stored_hash) = stored_hash);
END;
$$;

-- Function to set admin PIN (can only be called once or to update)
CREATE OR REPLACE FUNCTION set_admin_pin(new_pin text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM admin_config;
  INSERT INTO admin_config (pin_hash) VALUES (crypt(new_pin, gen_salt('bf', 10)));
END;
$$;

-- DELETE policy on transactions: only allowed when PIN is verified via app header
-- The app will call verify_admin_pin() via a DB function RPC before deleting
-- We use a permissive policy for anon delete that requires PIN verification
CREATE POLICY "Admin can delete any transaction with PIN"
  ON transactions
  FOR DELETE
  TO anon
  USING (verify_admin_pin(current_setting('app.admin_pin', true)));

CREATE POLICY "Admin can delete authenticated transactions with PIN"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (verify_admin_pin(current_setting('app.admin_pin', true)));
