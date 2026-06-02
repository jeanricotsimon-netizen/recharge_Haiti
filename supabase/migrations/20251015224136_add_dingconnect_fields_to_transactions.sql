/*
  # Add DingConnect required fields to transactions table

  1. New Columns
    - `distributor_ref` (text) - Internal transaction ID (DistributorRef)
    - `transfer_ref` (text) - DingConnect transaction ID (TransferRef)
    - `receive_value` (decimal) - Amount received in destination currency
    - `receive_value_excluding_tax` (decimal) - Amount received excluding taxes
    - `receive_currency_iso` (text) - Destination currency code
    - `send_value` (decimal) - Amount sent in origin currency
    - `send_currency_iso` (text) - Origin currency code
    - `fx_rate` (decimal) - Exchange rate applied
    - `default_display_text` (text) - Product description for bundles/data/vouchers
    - `validity_period_iso` (text) - Validity period in ISO format (e.g., P7D = 7 days)
    - `receipt_text` (text) - PIN/Voucher codes
    - `description` (text) - Full product description markdown
    - `read_more` (text) - PIN redemption instructions markdown
    - `sku_code` (text) - Product SKU code

  2. Changes
    - Rename `ding_transaction_id` to be an alias for `transfer_ref` for backward compatibility
*/

-- Add new DingConnect required fields
DO $$
BEGIN
  -- Add distributor_ref if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'distributor_ref'
  ) THEN
    ALTER TABLE transactions ADD COLUMN distributor_ref text;
  END IF;

  -- Add transfer_ref if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'transfer_ref'
  ) THEN
    ALTER TABLE transactions ADD COLUMN transfer_ref text;
  END IF;

  -- Add receive_value if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'receive_value'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receive_value decimal(10,2);
  END IF;

  -- Add receive_value_excluding_tax if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'receive_value_excluding_tax'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receive_value_excluding_tax decimal(10,2);
  END IF;

  -- Add receive_currency_iso if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'receive_currency_iso'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receive_currency_iso text;
  END IF;

  -- Add send_value if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'send_value'
  ) THEN
    ALTER TABLE transactions ADD COLUMN send_value decimal(10,2);
  END IF;

  -- Add send_currency_iso if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'send_currency_iso'
  ) THEN
    ALTER TABLE transactions ADD COLUMN send_currency_iso text;
  END IF;

  -- Add fx_rate if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'fx_rate'
  ) THEN
    ALTER TABLE transactions ADD COLUMN fx_rate decimal(10,6);
  END IF;

  -- Add default_display_text if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'default_display_text'
  ) THEN
    ALTER TABLE transactions ADD COLUMN default_display_text text;
  END IF;

  -- Add validity_period_iso if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'validity_period_iso'
  ) THEN
    ALTER TABLE transactions ADD COLUMN validity_period_iso text;
  END IF;

  -- Add receipt_text if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'receipt_text'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_text text;
  END IF;

  -- Add description if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'description'
  ) THEN
    ALTER TABLE transactions ADD COLUMN description text;
  END IF;

  -- Add read_more if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'read_more'
  ) THEN
    ALTER TABLE transactions ADD COLUMN read_more text;
  END IF;

  -- Add sku_code if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'sku_code'
  ) THEN
    ALTER TABLE transactions ADD COLUMN sku_code text;
  END IF;
END $$;

-- Create index on transfer_ref for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_ref ON transactions(transfer_ref);

-- Create index on distributor_ref for fast lookups
CREATE INDEX IF NOT EXISTS idx_transactions_distributor_ref ON transactions(distributor_ref);

-- Update existing records: copy ding_transaction_id to transfer_ref if not already set
UPDATE transactions 
SET transfer_ref = ding_transaction_id 
WHERE transfer_ref IS NULL AND ding_transaction_id IS NOT NULL;