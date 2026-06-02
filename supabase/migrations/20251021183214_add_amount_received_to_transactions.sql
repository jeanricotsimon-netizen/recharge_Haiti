/*
  # Add amount_received field to transactions table

  1. Changes
    - Add `amount_received` column (numeric) to store the local currency amount received by the recipient
    - Add `amount_received_currency` column (text) to store the currency code (e.g., 'HTG', 'DOP')
  
  2. Notes
    - This field stores the value that the recipient actually receives in their local currency
    - Example: User sends BRL 7, recipient receives HTG 481.80
    - Both columns are optional to maintain compatibility with existing records
*/

DO $$
BEGIN
  -- Add amount_received column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'amount_received'
  ) THEN
    ALTER TABLE transactions ADD COLUMN amount_received numeric;
  END IF;

  -- Add amount_received_currency column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'amount_received_currency'
  ) THEN
    ALTER TABLE transactions ADD COLUMN amount_received_currency text;
  END IF;
END $$;