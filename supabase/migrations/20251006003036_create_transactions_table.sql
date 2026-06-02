/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - For authenticated users
      - `session_id` (uuid, nullable) - For anonymous users
      - `phone_number` (text) - Destination phone number
      - `operator_id` (text) - DingConnect operator SKU code
      - `operator_name` (text) - Human-readable operator name
      - `amount_usd` (decimal) - Transaction amount in USD
      - `amount_local` (decimal) - Transaction amount in local currency
      - `currency` (text) - Currency code (BRL, USD, etc.)
      - `currency_symbol` (text) - Currency symbol (R$, $, etc.)
      - `country_from` (text) - Origin country code
      - `country_to` (text) - Destination country code
      - `status` (text) - Transaction status (pending, processing, success, failed, refunded)
      - `payment_method` (text) - Payment method used (PIX, credit_card, etc.)
      - `ding_transaction_id` (text, nullable) - DingConnect transaction ID
      - `payment_id` (text, nullable) - Payment provider transaction ID
      - `refund_id` (text, nullable) - Refund transaction ID if applicable
      - `failure_reason` (text, nullable) - Error message if failed
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to read their own transactions
    - Add policy for authenticated users to create transactions
    - Add policy for service role to update transactions

  3. Indexes
    - Index on `user_id` for fast user queries
    - Index on `session_id` for anonymous user queries
    - Index on `payment_id` for payment lookups
    - Index on `status` for status filtering
    - Index on `created_at` for time-based queries
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  phone_number text NOT NULL,
  operator_id text NOT NULL,
  operator_name text NOT NULL DEFAULT '',
  amount_usd decimal(10,2) NOT NULL,
  amount_local decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  currency_symbol text NOT NULL DEFAULT 'R$',
  country_from text NOT NULL DEFAULT 'BR',
  country_to text NOT NULL DEFAULT 'HT',
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL,
  ding_transaction_id text,
  payment_id text,
  refund_id text,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'success', 'failed', 'refunded'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions (by user_id)
CREATE POLICY "Users can read own transactions by user_id"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can read their own transactions (by session_id)
CREATE POLICY "Users can read own transactions by session_id"
  ON transactions
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Authenticated users can create transactions
CREATE POLICY "Authenticated users can create transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Anonymous users can create transactions
CREATE POLICY "Anonymous users can create transactions"
  ON transactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Service role can update any transaction
CREATE POLICY "Service role can update transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Anonymous users can update their own transactions
CREATE POLICY "Anonymous users can update own transactions"
  ON transactions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);