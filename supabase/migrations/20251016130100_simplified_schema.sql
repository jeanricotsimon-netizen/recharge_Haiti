/*
  # Simplified Transaction Schema

  1. Changes
    - Remove payment-related fields (paymentId, refundId)
    - Keep only essential fields for DingConnect recharges
    - Maintain transaction history tracking

  2. Fields Kept
    - id, userId, phoneNumber, operator, operatorName
    - amount, currency, currencySymbol
    - countryFrom, countryTo
    - status (pending, success, failed)
    - dingconnectTransactionId
    - errorMessage
    - createdAt, updatedAt
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'paymentId'
  ) THEN
    ALTER TABLE transactions DROP COLUMN IF EXISTS paymentId;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'refundId'
  ) THEN
    ALTER TABLE transactions DROP COLUMN IF EXISTS refundId;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'paymentMethod'
  ) THEN
    ALTER TABLE transactions DROP COLUMN IF EXISTS paymentMethod;
  END IF;
END $$;
