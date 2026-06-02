# ✅ Checklist Completo Pré-Produção

## 🎯 Use este checklist antes de ativar o modo produção

---

## 1️⃣ VALIDAÇÃO TÉCNICA

### Backend (Edge Functions)

- [ ] **Todas as Edge Functions deployadas**
  - [ ] dingconnect-operators
  - [ ] dingconnect-recharge
  - [ ] paypal-payment
  - [ ] paypal-capture
  - [ ] paypal-execute
  - [ ] paypal-status
  - [ ] paypal-refund
  - [ ] mercadopago-payment (se usar PIX)

- [ ] **Secrets configurados no Supabase**
  - [ ] DINGCONNECT_API_KEY
  - [ ] PAYPAL_CLIENT_ID (produção)
  - [ ] PAYPAL_SECRET (produção)
  - [ ] PAYPAL_MODE=production
  - [ ] MERCADOPAGO_ACCESS_TOKEN (se usar)

- [ ] **Database configurado**
  - [ ] Tabela `transactions` criada
  - [ ] RLS policies ativas
  - [ ] Índices para performance

### Frontend

- [ ] **Build de produção funciona**
  ```bash
  npm run build
  # Sem erros
  ```

- [ ] **Variáveis de ambiente corretas**
  - [ ] VITE_SUPABASE_URL (produção)
  - [ ] VITE_SUPABASE_ANON_KEY (produção)
  - [ ] VITE_PAYPAL_MODE=production

- [ ] **Script PayPal atualizado**
  - [ ] Client ID de produção no `index.html`
  - [ ] Não está usando credenciais de sandbox

- [ ] **Avisos de teste removidos**
  - [ ] Sem "Modo teste"
  - [ ] Sem "Sandbox"
  - [ ] Sem "🧪" ou badges de teste

---

## 2️⃣ TESTES SANDBOX

### Pagamentos

- [ ] **10+ transações de teste realizadas**
- [ ] **Pagamentos aprovados** (70%+ sucesso)
- [ ] **Pagamentos cancelados** tratados
- [ ] **Valores diversos testados** ($5, $10, $20, $50)
- [ ] **Diferentes moedas** (USD, CAD, EUR, MXN)

### Recargas

- [ ] **Recargas processadas com sucesso**
- [ ] **Operadores diversos testados**
- [ ] **Países diversos testados**
- [ ] **Recebimento confirmado** (em telefone de teste)

### Histórico

- [ ] **Transações aparecem no histórico**
- [ ] **Status corretos** (pending, processing, completed, failed)
- [ ] **Valores corretos** salvos
- [ ] **Datas corretas**

---

## 3️⃣ CONTA PAYPAL BUSINESS

### Criação e Verificação

- [ ] **Conta Business criada**
  - Email: ________________
  - Nome da empresa: ________________

- [ ] **Conta verificada**
  - [ ] Email confirmado
  - [ ] Identidade verificada
  - [ ] Conta bancária vinculada
  - [ ] Aprovação do PayPal recebida

- [ ] **Preferências configuradas**
  - [ ] Moedas aceitas (USD, CAD, EUR, MXN)
  - [ ] Recebimentos automáticos ativados
  - [ ] Bloqueios desativados

### Credenciais de Produção

- [ ] **App de produção criado** no PayPal Developer
- [ ] **Client ID de produção** copiado
- [ ] **Secret de produção** copiado
- [ ] **Credenciais salvas** em local seguro (1Password, etc.)

---

## 4️⃣ DINGCONNECT

### Conta e API

- [ ] **Conta DingConnect ativa**
- [ ] **API Key de produção** obtida
- [ ] **Créditos suficientes** na conta
- [ ] **Limites conhecidos**
  - Limite diário: ________________
  - Limite por transação: ________________

### Testes de API

- [ ] **API de operadores funcionando**
  ```bash
  curl https://api.dingconnect.com/v1/operators
  ```

- [ ] **API de recarga funcionando**
  ```bash
  # Testar com valor mínimo em sandbox
  ```

---

## 5️⃣ INFRAESTRUTURA

### Hospedagem

- [ ] **Domínio próprio configurado**
  - URL: ________________
  - SSL/HTTPS ativo

- [ ] **Deploy configurado**
  - Plataforma: [ ] Netlify [ ] Vercel [ ] Outro: ______
  - CI/CD ativo (deploy automático)

- [ ] **Backups configurados**
  - Banco de dados: Automático via Supabase
  - Código: Git + GitHub

### Performance

- [ ] **Tempo de carregamento < 3s**
- [ ] **Mobile responsivo**
- [ ] **Funciona em principais navegadores**
  - [ ] Chrome
  - [ ] Safari
  - [ ] Firefox
  - [ ] Edge

---

## 6️⃣ SEGURANÇA

### Dados Sensíveis

- [ ] **Nenhuma credencial no código fonte**
- [ ] **Secrets apenas no Supabase**
- [ ] **.env.local no .gitignore**
- [ ] **HTTPS obrigatório em produção**

### Validações

- [ ] **Validação de entrada de dados**
  - [ ] Números de telefone
  - [ ] Valores de recarga
  - [ ] Países e operadores

- [ ] **Rate limiting** (se configurado)
- [ ] **CORS configurado** nas Edge Functions

### Compliance

- [ ] **LGPD/GDPR** considerado
  - [ ] Política de privacidade
  - [ ] Consentimento de dados

---

## 7️⃣ LEGAL E COMPLIANCE

### Páginas Obrigatórias

- [ ] **Termos de Serviço** publicados
  - URL: ________________

- [ ] **Política de Privacidade** publicada
  - URL: ________________

- [ ] **Política de Reembolso** publicada
  - URL: ________________

- [ ] **Informações de Contato** visíveis
  - Email: ________________
  - WhatsApp/Telefone: ________________

### PayPal Compliance

- [ ] **Website profissional**
- [ ] **Descrição clara do serviço**
- [ ] **Não vende produtos proibidos**
- [ ] **Informações da empresa visíveis**

---

## 8️⃣ MONITORAMENTO

### Logs

- [ ] **Logs das Edge Functions** acessíveis
- [ ] **Sentry ou similar** configurado (opcional)
- [ ] **Alertas de erro** configurados

### Analytics

- [ ] **Google Analytics** ou similar (opcional)
- [ ] **Métricas de conversão** rastreadas
- [ ] **Dashboard de transações** funcional

### Queries de Monitoramento

```sql
-- Taxa de sucesso (rodar diariamente)
SELECT
  status,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Transações do dia
SELECT COUNT(*), SUM(amount)
FROM transactions
WHERE created_at::date = CURRENT_DATE;

-- Top erros
SELECT error_message, COUNT(*)
FROM transactions
WHERE status = 'failed'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY error_message
ORDER BY COUNT(*) DESC;
```

---

## 9️⃣ FINANCEIRO

### Taxas e Custos

- [ ] **Taxas do PayPal conhecidas**
  - Doméstico: 2.9% + $0.30
  - Internacional: 4.4% + valor fixo

- [ ] **Custos do DingConnect conhecidos**
  - Por recarga: ________________

- [ ] **Margem de lucro calculada**
  - Sua taxa: 30%
  - Lucro líquido estimado: ________________

### Projeções

- [ ] **Meta de faturamento mês 1**: $ ________________
- [ ] **Meta de transações mês 1**: ________________
- [ ] **Break-even calculado**: ________________

---

## 🔟 SUPORTE AO CLIENTE

### Canais de Atendimento

- [ ] **Email de suporte** configurado
  - Email: ________________
  - Auto-resposta configurada

- [ ] **WhatsApp Business** (recomendado)
  - Número: ________________

- [ ] **FAQ** criado
  - Questões mais comuns respondidas

### Processos

- [ ] **Processo de reembolso** definido
  - Prazo: ________________
  - Método: ________________

- [ ] **Processo de dispute** definido
- [ ] **Template de respostas** criados

---

## 1️⃣1️⃣ MARKETING (Opcional para lançamento)

### Preparação

- [ ] **Logo profissional**
- [ ] **Redes sociais criadas**
  - [ ] Instagram
  - [ ] Facebook
  - [ ] TikTok
  - [ ] Twitter/X

- [ ] **Conteúdo inicial criado**
  - [ ] Posts de lançamento
  - [ ] Stories
  - [ ] Vídeo explicativo

### Estratégia de Lançamento

- [ ] **Público-alvo definido**
- [ ] **Canais de divulgação** escolhidos
- [ ] **Budget de marketing** definido
- [ ] **Promoção de lançamento** (desconto, cashback)

---

## 1️⃣2️⃣ TESTE FINAL EM PRODUÇÃO

### ⚠️ IMPORTANTE: Primeiro Teste Real

- [ ] **Teste #1: Valor mínimo ($5)**
  - Data: ________________
  - Resultado: ________________

- [ ] **Pagamento processado**
- [ ] **Recarga entregue**
- [ ] **Transação salva**
- [ ] **Histórico atualizado**

### Validação

- [ ] **Dinheiro real debitado** conforme esperado
- [ ] **Taxa calculada corretamente**
- [ ] **Recarga chegou no telefone**
- [ ] **Email de confirmação** enviado (se configurado)

---

## 📊 SCORE DE PRONTIDÃO

**Calcule seu score:**

Total de itens: ~100
Itens marcados: ______

**Score de Prontidão:**
- 90-100%: ✅ **Pronto para produção**
- 70-89%: ⚠️ **Quase pronto, revisar itens faltantes**
- <70%: ❌ **Não recomendado ativar produção**

---

## 🚀 LANÇAMENTO

### Quando você estiver 100% pronto:

1. ✅ Revisar este checklist completamente
2. 🔐 Atualizar secrets do Supabase
3. 🎨 Atualizar frontend com Client ID de produção
4. 📦 Deploy de produção
5. 🧪 Teste inicial com $5
6. 👀 Monitorar de perto primeiras 24h
7. 📢 Anunciar lançamento

---

## 📞 CONTATOS DE EMERGÊNCIA

**PayPal Support:**
- Telefone: ________________
- Email: ________________

**DingConnect Support:**
- Email: ________________
- WhatsApp: ________________

**Seu Suporte Técnico:**
- Desenvolvedor: ________________
- DevOps: ________________

---

## 📝 NOTAS FINAIS

Use este espaço para anotações:

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

---

**Data de revisão deste checklist:** ________________

**Responsável:** ________________

**Data prevista do lançamento:** ________________

---

**🎯 BOA SORTE COM O LANÇAMENTO!**
