/*
  # Limpeza e organização da tabela transactions

  ## Mudanças
  Remove campos duplicados e desnecessários da tabela transactions para simplificar a estrutura.

  ## Campos removidos:
  
  ### Duplicados:
  - `currency_symbol` - pode ser derivado de currency
  - `send_value` - duplicado de amount
  - `send_currency_iso` - duplicado de currency
  - `amount_received` - duplicado de receive_value
  - `amount_received_currency` - duplicado de receive_currency_iso
  - `transfer_ref` - duplicado de ding_transaction_id

  ### Campos internos da API (não necessários):
  - `receive_value_excluding_tax` - detalhe interno da API
  - `default_display_text` - texto padrão da API
  - `validity_period_iso` - período de validade
  - `receipt_text` - texto do recibo
  - `description` - descrição genérica
  - `read_more` - link de mais informações
  - `sku_code` - código SKU interno
  - `fx_rate` - taxa de câmbio (calculável)

  ## Campos mantidos (essenciais):
  - id, user_id, session_id
  - phone_number, operator_id, operator_name
  - country_from, country_to
  - amount (valor pago em BRL)
  - currency (sempre BRL)
  - receive_value (valor recebido em HTG/DOP)
  - receive_currency_iso (HTG ou DOP)
  - status, payment_method
  - ding_transaction_id (TransferRef da API)
  - payment_id, refund_id
  - distributor_ref (nossa referência única)
  - failure_reason
  - created_at, updated_at

  ## Notas
  - Mantém compatibilidade com código existente
  - Remove redundâncias mantendo informações essenciais
  - Tabela mais limpa e fácil de manter
*/

-- Remove campos duplicados
ALTER TABLE transactions DROP COLUMN IF EXISTS currency_symbol;
ALTER TABLE transactions DROP COLUMN IF EXISTS send_value;
ALTER TABLE transactions DROP COLUMN IF EXISTS send_currency_iso;
ALTER TABLE transactions DROP COLUMN IF EXISTS amount_received;
ALTER TABLE transactions DROP COLUMN IF EXISTS amount_received_currency;
ALTER TABLE transactions DROP COLUMN IF EXISTS transfer_ref;

-- Remove campos internos da API (não necessários para nosso sistema)
ALTER TABLE transactions DROP COLUMN IF EXISTS receive_value_excluding_tax;
ALTER TABLE transactions DROP COLUMN IF EXISTS default_display_text;
ALTER TABLE transactions DROP COLUMN IF EXISTS validity_period_iso;
ALTER TABLE transactions DROP COLUMN IF EXISTS receipt_text;
ALTER TABLE transactions DROP COLUMN IF EXISTS description;
ALTER TABLE transactions DROP COLUMN IF EXISTS read_more;
ALTER TABLE transactions DROP COLUMN IF EXISTS sku_code;
ALTER TABLE transactions DROP COLUMN IF EXISTS fx_rate;

-- Adiciona comentários aos campos mantidos para documentação
COMMENT ON COLUMN transactions.amount IS 'Valor pago pelo cliente em BRL';
COMMENT ON COLUMN transactions.currency IS 'Moeda de pagamento (sempre BRL)';
COMMENT ON COLUMN transactions.receive_value IS 'Valor recebido pelo destinatário (HTG ou DOP)';
COMMENT ON COLUMN transactions.receive_currency_iso IS 'Moeda recebida pelo destinatário';
COMMENT ON COLUMN transactions.ding_transaction_id IS 'TransferRef retornado pela API DingConnect';
COMMENT ON COLUMN transactions.distributor_ref IS 'Nossa referência única enviada para DingConnect';
COMMENT ON COLUMN transactions.operator_id IS 'ID da operadora (ex: HT_DG_TopUp)';
COMMENT ON COLUMN transactions.operator_name IS 'Nome da operadora (ex: Digicel Haiti)';