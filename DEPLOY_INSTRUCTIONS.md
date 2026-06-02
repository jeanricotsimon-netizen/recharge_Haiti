# 🚀 Instruções para Deploy das Edge Functions

## Problema Identificado

A autenticação OAuth2 está falhando porque as Edge Functions antigas ainda estão rodando no Supabase. Você precisa fazer o deploy das versões atualizadas.

## Solução: Deploy via Supabase Dashboard

### 1️⃣ Configure os Secrets (se ainda não fez)

Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/vault

Adicione/Atualize:
- **DINGCONNECT_CLIENT_ID**: `2f217bf9-ece9-4354-840f-dd2fbd7b041a`
- **DINGCONNECT_CLIENT_SECRET**: `6WalVCnBsf6nILpuiMSQ18N9mKgP1jFxovt71bpFq1E=`

### 2️⃣ Deploy da Edge Function: dingconnect-recharge

**Passo a passo:**

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions

2. Clique em **dingconnect-recharge**

3. Clique em **"Edit Function"** ou **"Redeploy"**

4. Substitua TODO o código pelo conteúdo do arquivo:
   - **Caminho local**: `/tmp/cc-agent/56916025/project/supabase/functions/dingconnect-recharge/index.ts`

5. Clique em **"Deploy"** ou **"Save & Deploy"**

### 3️⃣ Deploy da Edge Function: dingconnect-operators

Repita o mesmo processo para `dingconnect-operators`:

1. Acesse a função no dashboard
2. Substitua o código pelo arquivo: `/tmp/cc-agent/56916025/project/supabase/functions/dingconnect-operators/index.ts`
3. Deploy

## ✅ O que foi corrigido no código

- ✅ Endpoint OAuth2 correto: `https://idp.ding.com/connect/token`
- ✅ **ORDEM DOS PARÂMETROS CORRIGIDA** (seguindo documentação exata da DingConnect)
- ✅ Formato OAuth2: `client_id`, depois `client_secret`, depois `grant_type`
- ✅ Content-Type: `application/x-www-form-urlencoded`
- ✅ Cache de token (3 horas de validade)
- ✅ Tratamento de erros OAuth2 específico

**Código corrigido:**
```javascript
// ✅ FORMATO CORRETO (ordem importa!)
const params = new URLSearchParams();
params.append('client_id', DINGCONNECT_CLIENT_ID);
params.append('client_secret', DINGCONNECT_CLIENT_SECRET);
params.append('grant_type', 'client_credentials');
```

**Teste confirmado:** API funcionando perfeitamente no Postman com access_token válido!

## 🧪 Testar após o deploy

1. Abra a aplicação
2. Tente fazer uma recarga
3. Se funcionar, você verá: **"Recarga REAL enviada - aguardando confirmação"**

## ⚠️ Se ainda não funcionar

Verifique nos logs da Edge Function (no dashboard do Supabase) se:
- Os secrets estão sendo carregados corretamente
- A requisição OAuth2 está retornando token
- O token está sendo usado nas requisições subsequentes

## 📋 Alternativa: Deploy via CLI

Se preferir usar a CLI do Supabase:

```bash
# Instalar CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Link do projeto
supabase link --project-ref ptdffidlieebxxnznezy

# Deploy das funções
supabase functions deploy dingconnect-recharge
supabase functions deploy dingconnect-operators
```

## 🎯 Resultado Esperado

Após o deploy, a autenticação OAuth2 funcionará e você verá nos logs:

```
🔐 DingConnect: Obtendo token OAuth2
📤 DingConnect: Enviando requisição OAuth2
📥 DingConnect: Resposta OAuth2: { status: 200, ok: true }
✅ DingConnect: OAuth2 bem-sucedido
```
