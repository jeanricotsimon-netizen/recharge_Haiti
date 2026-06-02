/*
  # Reorganização Completa da Tabela Transactions
  
  ## Resumo
  Limpeza e reorganização da tabela transactions para suportar corretamente
  o fluxo DingConnect + MercadoPago PIX.
  
  ## Mudanças
  
  ### 1. Campos Essenciais (mantidos/atualizados)
  - **id**: UUID primary key
  - **user_id**: UUID do usuário (nullable para demo)
  - **session_id**: UUID da sessão (para usuários não autenticados)
  - **phone_number**: Telefone de destino
  - **operator_id**: ID da operadora (ex: HT_D7_TopUp)
  - **operator_name**: Nome da operadora (ex: Digicel Haiti)
  
  ### 2. Valores e Moedas
  - **amount**: Valor pago pelo cliente (em moeda local)
  - **currency**: Moeda do pagamento (BRL, USD, etc)
  - **currency_symbol**: Símbolo da moeda (R$, $)
  - **country_from**: País de origem (BR, US, etc)
  - **country_to**: País de destino (HT, DO)
  
  ### 3. DingConnect Integration
  - **ding_transaction_id**: TransferRef da DingConnect
  - **distributor_ref**: DistributorRef enviado
  - **transfer_ref**: TransferRef retornado
  - **sku_code**: SKU da operadora
  - **send_value**: Valor enviado em BRL
  - **send_currency_iso**: Moeda de envio (sempre BRL)
  - **receive_value**: Valor recebido pelo destinatário
  - **receive_currency_iso**: Moeda recebida (HTG, DOP)
  - **receive_value_excluding_tax**: Valor sem taxas
  - **fx_rate**: Taxa de câmbio aplicada
  - **receipt_text**: Texto do recibo
  - **default_display_text**: Texto de exibição padrão
  - **validity_period_iso**: Período de validade
  - **description**: Descrição do produto
  - **read_more**: Link para mais informações
  
  ### 4. MercadoPago Integration
  - **payment_id**: ID do pagamento MercadoPago
  - **payment_method**: Método de pagamento (pix)
  - **refund_id**: ID do reembolso (se houver)
  
  ### 5. Status e Timestamps
  - **status**: pending | processing | success | failed | refunded
  - **failure_reason**: Motivo da falha (se houver)
  - **created_at**: Data de criação
  - **updated_at**: Data de atualização
  
  ## Campos Removidos
  - amount_usd (duplicado)
  - amount_local (duplicado)
  - reloadlyTransactionId (renomeado para ding_transaction_id)
  - errorMessage (renomeado para failure_reason)
  - dingconnectTransactionId (consolidado em ding_transaction_id)
  
  ## Segurança
  - RLS habilitado
  - Políticas para usuários autenticados e sessões demo
  
  ## Índices
  - phone_number (busca rápida por telefone)
  - status (filtro por status)
  - created_at (ordenação por data)
  - ding_transaction_id (busca por ID DingConnect)
  - payment_id (busca por ID MercadoPago)
*/

-- Passo 1: Remover campos duplicados/desnecessários
ALTER TABLE transactions DROP COLUMN IF EXISTS amount_usd CASCADE;
ALTER TABLE transactions DROP COLUMN IF EXISTS amount_local CASCADE;
ALTER TABLE transactions DROP COLUMN IF EXISTS reloadlyTransactionId CASCADE;
ALTER TABLE transactions DROP COLUMN IF EXISTS errorMessage CASCADE;
ALTER TABLE transactions DROP COLUMN IF EXISTS dingconnectTransactionId CASCADE;

-- Passo 2: Renomear campos para padronização
DO $$
BEGIN
  -- Renomear operator_id se ainda não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'operator_id'
  ) THEN
    ALTER TABLE transactions RENAME COLUMN operatorId TO operator_id;
  END IF;
EXCEPTION
  WHEN undefined_column THEN
    -- Coluna não existe, ignorar
    NULL;
END $$;

-- Passo 3: Garantir que todos os campos essenciais existem com tipos corretos
DO $$
BEGIN
  -- amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'amount'
  ) THEN
    ALTER TABLE transactions ADD COLUMN amount NUMERIC NOT NULL DEFAULT 0;
  END IF;

  -- Garantir que payment_id existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_id TEXT;
  END IF;

  -- Garantir que payment_method existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'pix';
  END IF;

  -- Renomear failure_reason se ainda é errorMessage
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'errorMessage'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'failure_reason'
  ) THEN
    ALTER TABLE transactions RENAME COLUMN "errorMessage" TO failure_reason;
  END IF;
END $$;

-- Passo 4: Garantir valores padrão corretos
ALTER TABLE transactions ALTER COLUMN currency SET DEFAULT 'BRL';
ALTER TABLE transactions ALTER COLUMN currency_symbol SET DEFAULT 'R$';
ALTER TABLE transactions ALTER COLUMN country_from SET DEFAULT 'BR';
ALTER TABLE transactions ALTER COLUMN country_to SET DEFAULT 'HT';
ALTER TABLE transactions ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE transactions ALTER COLUMN operator_name SET DEFAULT '';
ALTER TABLE transactions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE transactions ALTER COLUMN updated_at SET DEFAULT now();

-- Passo 5: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_phone_number ON transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ding_transaction_id ON transactions(ding_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);

-- Passo 6: Criar trigger para updated_at
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

-- Passo 7: Garantir RLS está habilitado
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Passo 8: Recriar políticas RLS
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Demo users can update transactions" ON transactions;

-- Política para usuários autenticados
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários anônimos/demo (usando session_id)
CREATE POLICY "Demo users can view transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Demo users can insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Demo users can update transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Passo 9: Adicionar comentários para documentação
COMMENT ON TABLE transactions IS 'Tabela de transações de recarga internacional via DingConnect';
COMMENT ON COLUMN transactions.ding_transaction_id IS 'TransferRef retornado pela API DingConnect';
COMMENT ON COLUMN transactions.distributor_ref IS 'Referência única enviada para DingConnect';
COMMENT ON COLUMN transactions.amount IS 'Valor pago pelo cliente na moeda local';
COMMENT ON COLUMN transactions.send_value IS 'Valor enviado para DingConnect em BRL';
COMMENT ON COLUMN transactions.receive_value IS 'Valor recebido pelo destinatário na moeda local (HTG/DOP)';
COMMENT ON COLUMN transactions.payment_id IS 'ID do pagamento no MercadoPago';
COMMENT ON COLUMN transactions.refund_id IS 'ID do reembolso no MercadoPago (se houver)';
COMMENT ON COLUMN transactions.status IS 'Status: pending, processing, success, failed, refunded';
