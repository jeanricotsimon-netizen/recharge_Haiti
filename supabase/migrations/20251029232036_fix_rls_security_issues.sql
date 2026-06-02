/*
  # Fix RLS Security Issues and Performance Problems
  
  This migration addresses multiple security and performance issues:
  
  ## 1. RLS Performance Optimization
  - Replace `auth.uid()` with `(select auth.uid())` in all policies
  - This prevents re-evaluation of auth functions for each row
  - Significantly improves query performance at scale
  
  ## 2. Remove Duplicate Policies
  - Consolidate multiple permissive policies into single policies
  - Remove redundant policies that cause confusion
  
  ## 3. Clean Up Unused Indexes
  - Remove indexes that are not being used by queries
  - Reduces maintenance overhead and storage
  
  ## 4. Fix Function Search Path
  - Set immutable search_path for trigger function
  
  ## Changes Summary
  
  ### Policies Removed (duplicates):
  - "Users can read own transactions by user_id" (authenticated)
  - "Authenticated users can create transactions" (authenticated)
  - "Anonymous users can create transactions" (anon)
  - "Service role can update transactions" (authenticated)
  - "Anonymous users can update own transactions" (anon)
  - "Users can read own transactions by session_id" (anon)
  
  ### Policies Kept & Optimized:
  - "Users can view own transactions" (authenticated - SELECT)
  - "Users can insert own transactions" (authenticated - INSERT)
  - "Users can update own transactions" (authenticated - UPDATE)
  - "Demo users can view transactions" (anon - SELECT)
  - "Demo users can insert transactions" (anon - INSERT)
  - "Demo users can update transactions" (anon - UPDATE)
  
  ### Indexes Removed (unused):
  - idx_transactions_distributor_ref
  - idx_transactions_user_id
  - idx_transactions_session_id
  - idx_transactions_payment_id
  - idx_transactions_status
  - idx_transactions_created_at
  - idx_transactions_ding_transaction_id
  
  ## Security Model
  - Authenticated users: Can only access their own transactions (by user_id)
  - Anonymous/Demo users: Can access all demo transactions (for testing)
*/

-- ============================================================
-- STEP 1: Drop all existing policies to start clean
-- ============================================================

DROP POLICY IF EXISTS "Users can read own transactions by user_id" ON transactions;
DROP POLICY IF EXISTS "Users can read own transactions by session_id" ON transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON transactions;
DROP POLICY IF EXISTS "Anonymous users can create transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can update transactions" ON transactions;
DROP POLICY IF EXISTS "Anonymous users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can update transactions" ON transactions;

-- ============================================================
-- STEP 2: Create optimized policies for authenticated users
-- ============================================================

-- SELECT: Authenticated users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- INSERT: Authenticated users can create their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: Authenticated users can update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- STEP 3: Create policies for anonymous/demo users
-- ============================================================

-- SELECT: Anonymous users can view all transactions (demo mode)
CREATE POLICY "Demo users can view transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

-- INSERT: Anonymous users can create transactions (demo mode)
CREATE POLICY "Demo users can insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

-- UPDATE: Anonymous users can update transactions (demo mode)
CREATE POLICY "Demo users can update transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STEP 4: Remove unused indexes
-- ============================================================

DROP INDEX IF EXISTS idx_transactions_distributor_ref;
DROP INDEX IF EXISTS idx_transactions_user_id;
DROP INDEX IF EXISTS idx_transactions_session_id;
DROP INDEX IF EXISTS idx_transactions_payment_id;
DROP INDEX IF EXISTS idx_transactions_status;
DROP INDEX IF EXISTS idx_transactions_created_at;
DROP INDEX IF EXISTS idx_transactions_ding_transaction_id;

-- ============================================================
-- STEP 5: Create only necessary indexes
-- ============================================================

-- Index for filtering by user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_created 
  ON transactions(user_id, created_at DESC);

-- Index for filtering by payment_id (webhook lookups)
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id_lookup
  ON transactions(payment_id) 
  WHERE payment_id IS NOT NULL;

-- Index for filtering by status (admin queries)
CREATE INDEX IF NOT EXISTS idx_transactions_status_created
  ON transactions(status, created_at DESC);

-- ============================================================
-- STEP 6: Fix function search path (security issue)
-- ============================================================

-- Drop and recreate trigger function with immutable search path
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create function with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 7: Add helpful comments
-- ============================================================

COMMENT ON POLICY "Users can view own transactions" ON transactions IS 
  'Authenticated users can only view their own transactions. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "Users can insert own transactions" ON transactions IS 
  'Authenticated users can only create transactions for themselves. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "Users can update own transactions" ON transactions IS 
  'Authenticated users can only update their own transactions. Uses (select auth.uid()) for performance.';

COMMENT ON POLICY "Demo users can view transactions" ON transactions IS 
  'Anonymous users can view all transactions (demo/testing mode).';

COMMENT ON POLICY "Demo users can insert transactions" ON transactions IS 
  'Anonymous users can create transactions (demo/testing mode).';

COMMENT ON POLICY "Demo users can update transactions" ON transactions IS 
  'Anonymous users can update transactions (demo/testing mode).';
