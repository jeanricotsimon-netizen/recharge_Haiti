# ✅ Checklist de Testes Pós-Deploy

Use este checklist após fazer deploy no Netlify/Vercel para garantir que tudo está funcionando.

---

## 1️⃣ Verificações Básicas

### App Carregou Corretamente?
- [ ] Página inicial abre sem erros
- [ ] Console do navegador sem erros críticos (F12)
- [ ] Todos os componentes aparecem corretamente
- [ ] Não há mensagens de variáveis de ambiente faltando

**Como verificar:**
1. Abra a URL do Netlify: `https://seu-app.netlify.app`
2. Pressione F12 para abrir DevTools
3. Vá na aba Console
4. Recarregue a página (F5)
5. Verifique se não há erros vermelhos

---

## 2️⃣ Teste do PayPal SDK

### PayPal SDK Carregou?
- [ ] Sem erro "PayPal SDK não carregou após 100 tentativas"
- [ ] Botão azul do PayPal aparece (não mensagem de erro)
- [ ] Console mostra: "✅ PayPal SDK carregado após X tentativas"

**Como verificar:**
1. Selecione um país (ex: Brasil)
2. Escolha um operador
3. Digite um número de telefone válido
4. Escolha método de pagamento: **PayPal**
5. Clique em "Processar Recarga"
6. O botão azul do PayPal deve aparecer

**Se aparecer erro:**
- Verifique no Console (F12) se há bloqueio de scripts
- Desative bloqueadores de anúncios/scripts
- Tente em navegador anônimo
- Verifique se Client ID está correto no `index.html`

---

## 3️⃣ Teste de Pagamento Sandbox

### Criar Conta de Teste PayPal
- [ ] Acessou: https://developer.paypal.com/dashboard/
- [ ] Fez login na conta PayPal Developer
- [ ] Foi em Sandbox → Accounts
- [ ] Tem contas Personal e Business criadas

**Contas disponíveis:**
```
Personal (Comprador):
Email: sb-xxxxx@personal.example.com
Senha: [gerada pelo PayPal]

Business (Vendedor):
Email: sb-yyyyy@business.example.com
Senha: [gerada pelo PayPal]
```

### Fazer Pagamento de Teste
- [ ] Clicou no botão PayPal no app
- [ ] Popup do PayPal abriu
- [ ] Fez login com conta **Personal** (comprador)
- [ ] Viu o valor correto da recarga
- [ ] Aprovou o pagamento
- [ ] Popup fechou
- [ ] App mostrou mensagem de sucesso

**Como fazer:**
1. No app deployado, clique em PayPal
2. Popup abre → Faça login com conta sandbox Personal
3. Revise o pagamento → Clique em "Complete Purchase"
4. Aguarde redirecionamento
5. Deve aparecer: "✅ Pagamento aprovado!"

---

## 4️⃣ Verificação no PayPal Dashboard

### Transação Apareceu no Sandbox?
- [ ] Acessou: https://developer.paypal.com/dashboard/
- [ ] Foi em Sandbox → Accounts
- [ ] Clicou na conta Business → View Details
- [ ] Viu a transação na lista

**Detalhes esperados:**
- Status: Completed
- Tipo: Payment received
- Valor: Correto (ex: $10.00 USD)
- De: Conta Personal de teste
- Para: Conta Business de teste

---

## 5️⃣ Verificação no Supabase

### Transação Salva no Banco?
- [ ] Acessou Supabase Dashboard
- [ ] Foi em Table Editor → transactions
- [ ] Viu a nova transação

**SQL para verificar:**
```sql
SELECT
  id,
  phone_number,
  amount,
  currency,
  payment_method,
  paypal_order_id,
  status,
  created_at
FROM transactions
ORDER BY created_at DESC
LIMIT 5;
```

**Campos esperados:**
- `payment_method`: 'paypal'
- `paypal_order_id`: Começa com número (ex: '1234567890')
- `status`: 'completed'
- `amount`: Valor correto

---

## 6️⃣ Teste do DingConnect

### Recarga Foi Enviada?
- [ ] Transação tem `dingconnect_transfer_id`
- [ ] Status é 'completed'
- [ ] Não há erro em `error_message`

**SQL para verificar:**
```sql
SELECT
  phone_number,
  amount,
  operator_id,
  dingconnect_transfer_id,
  status,
  error_message
FROM transactions
WHERE payment_method = 'paypal'
ORDER BY created_at DESC
LIMIT 1;
```

**Se falhar:**
- Verifique se DingConnect API Key está configurada
- Veja logs da Edge Function: `dingconnect-recharge`
- Verifique se operador está disponível no DingConnect

---

## 7️⃣ Teste de Histórico

### Histórico Mostra a Transação?
- [ ] Clicou em "Ver Histórico" no app
- [ ] Transação aparece na lista
- [ ] Todos os dados estão corretos
- [ ] Status é "Concluído"

---

## 8️⃣ Testes de Erro

### Cenários de Erro Funcionam?
- [ ] Cancelar pagamento → Mostra mensagem apropriada
- [ ] Fechar popup do PayPal → App volta ao estado inicial
- [ ] Tentar novamente após erro → Funciona

**Como testar:**
1. Inicie um pagamento
2. No popup do PayPal, clique em "Cancel and return"
3. Deve voltar ao app sem erros
4. Tente fazer outro pagamento → Deve funcionar

---

## 9️⃣ Teste em Diferentes Navegadores

### Compatibilidade
- [ ] Chrome/Edge → Funciona
- [ ] Firefox → Funciona
- [ ] Safari (Mac/iOS) → Funciona
- [ ] Mobile Chrome → Funciona
- [ ] Mobile Safari → Funciona

---

## 🔟 Teste de Diferentes Valores

### Valores Variados
- [ ] $5.00 → Funciona
- [ ] $10.00 → Funciona
- [ ] $20.00 → Funciona
- [ ] $50.00 → Funciona

---

## 📊 Relatório Final

Depois de completar todos os testes, preencha:

```
Data do teste: ___________
URL do deploy: ___________
Versão testada: ___________

Testes passados: _____ / 10
Testes falhados: _____

Problemas encontrados:
-
-
-

Pronto para produção? [ ] Sim  [ ] Não
```

---

## 🚨 Problemas Comuns e Soluções

### "PayPal SDK não carregou"
**Causa:** Bloqueador de scripts ou Client ID errado
**Solução:**
1. Desative bloqueadores
2. Verifique Client ID no `index.html`
3. Tente em navegador anônimo

### "Invalid client_id"
**Causa:** Client ID sandbox não está no código
**Solução:**
1. Abra `index.html`
2. Verifique a tag script do PayPal
3. Deve ter: `client-id=SEU_CLIENT_ID_SANDBOX`

### Transação não aparece no Supabase
**Causa:** Edge Function falhou ou CORS
**Solução:**
1. Verifique logs no Supabase Dashboard
2. Vá em Edge Functions → paypal-capture → Logs
3. Procure por erros

### DingConnect não enviou recarga
**Causa:** API Key inválida ou operador indisponível
**Solução:**
1. Verifique DINGCONNECT_API_KEY nas secrets
2. Teste a API Key manualmente
3. Verifique se operador existe no DingConnect

---

## ✅ Próximos Passos

Depois de todos os testes passarem:

1. [ ] Completar 10+ transações de teste
2. [ ] Testar todos os cenários de erro
3. [ ] Verificar que todas as recargas foram entregues
4. [ ] Documentar qualquer problema encontrado
5. [ ] Seguir guia: `MIGRACAO_PRODUCAO_PAYPAL.md`
6. [ ] Ativar modo produção
7. [ ] Fazer testes finais em produção
8. [ ] Lançar para usuários reais! 🚀

---

**Lembre-se:** Sandbox é para testes! Nenhum dinheiro real é cobrado.
