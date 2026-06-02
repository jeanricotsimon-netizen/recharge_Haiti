# 🚀 Configuração PRODUCTION no Netlify

## ⚠️ IMPORTANTE: MercadoPago está em MODO PRODUÇÃO
Cobranças PIX serão REAIS! Dinheiro será transferido para sua conta MercadoPago.

---

## 📋 Passo a Passo para Configurar Netlify

### 1. Acesse o Netlify Dashboard
- Vá para: https://app.netlify.com
- Faça login na sua conta
- Selecione o site: **jeanricot-rechargemo-t5t0**

### 2. Adicione as Variáveis de Ambiente

Clique em: **Site configuration** → **Environment variables** → **Add a variable**

Adicione TODAS estas variáveis (uma por uma):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ptdffidlieebxxnznezy.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZGZmaWRsaWVlYnh4bnpuZXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDgzMzksImV4cCI6MjA3NTI4NDMzOX0.d_z_5ZI4nD55A-ANZGomfL9Z3RXoNSBmisWY2EwL25g

# DingConnect API (PRODUCTION)
VITE_DINGCONNECT_API_KEY=F5JU160bsQq6dOzfwuyMwp

# MercadoPago PRODUCTION ⚠️ COBRANÇAS REAIS!
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-5413112594519532-070307-11f6968eaf3357c7526b4ef96acb1c9b-156425199

VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-e1f9d87a-822e-4b80-aee9-0163aa443f26

# PayPal PRODUCTION (Live Mode)
VITE_PAYPAL_CLIENT_ID=ATJSsU-5cdkof6_cENtlSsk0l4ER0ENCRqKUn0ppXRaXgRIHefppDyep9HvMrHxla5DVwPLYt38OupJl
```

### 3. Salve e Redeploy

Depois de adicionar TODAS as variáveis:

1. Clique em **Save**
2. Vá para a aba **Deploys**
3. Clique em **Trigger deploy** → **Clear cache and deploy site**
4. Aguarde o deploy completar (2-3 minutos)

---

## ✅ Como Verificar se Funcionou

Após o deploy, abra o console do navegador em:
https://jeanricot-rechargemo-t5t0.bolt.host

Você deve ver:

```
🚨 MercadoPago: MODO PRODUÇÃO ATIVADO - Cobranças PIX reais serão processadas!
🔄 DingConnect: MODO PRODUÇÃO - Recargas reais serão processadas
```

Se ainda aparecer "MODO TESTE", verifique se:
1. As variáveis foram salvas corretamente
2. Você fez o redeploy DEPOIS de salvar
3. Limpou o cache do navegador (Ctrl+Shift+R ou Cmd+Shift+R)

---

## 🔍 Status Atual

### MercadoPago
- ✅ Tokens: `APP_USR-` (PRODUCTION)
- ⚠️ Modo: PRODUÇÃO ATIVADO
- 💰 Cobranças: REAIS

### PayPal
- ✅ Client ID configurado
- ⚠️ Modo: LIVE (PRODUÇÃO)
- 💰 Cobranças: REAIS

### DingConnect
- ✅ API Key: PRODUCTION
- 📱 Recargas: REAIS para Haiti e República Dominicana

---

## ⚠️ ATENÇÃO: Modo Produção Ativado

- **MercadoPago PIX**: Cobranças reais em BRL (Real Brasileiro)
- **PayPal**: Cobranças reais em USD/EUR/outras moedas
- **DingConnect**: Recargas telefônicas reais enviadas

**Recomendação**: Teste primeiro com valores pequenos (R$ 5-10) para garantir que tudo funciona.

---

## 🆘 Suporte

Se precisar voltar para MODO TESTE, altere as variáveis para:

```bash
VITE_MERCADOPAGO_ACCESS_TOKEN=TEST-5413112594519532-070307-11f6968eaf3357c7526b4ef96acb1c9b-156425199
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-e1f9d87a-822e-4b80-aee9-0163aa443f26
```

E faça redeploy novamente.
