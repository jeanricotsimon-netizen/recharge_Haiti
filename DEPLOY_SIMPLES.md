# 🚨 DEPLOY NECESSÁRIO

## Status Atual
- ✅ Credenciais DingConnect: **FUNCIONANDO**
- ✅ Código local: **CORRETO**
- ❌ Código no Supabase: **DESATUALIZADO (v15)**

## Solução: Deploy Manual

### 1️⃣ Configure os Secrets
https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/vault

Adicione (ou edite se já existem):

```
DINGCONNECT_CLIENT_ID = 2f217bf9-ece9-4354-840f-dd2fbd7b041a
DINGCONNECT_CLIENT_SECRET = 6WalVCnBsf6nILpuiMSQ18N9mKgP1jFxovt71bpFq1E=
```

### 2️⃣ Faça o Deploy
https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions

1. Clique em **dingconnect-operators**
2. Clique em **Edit**
3. Apague todo o código
4. Copie o código de `supabase/functions/dingconnect-operators/index.ts`
5. Cole no editor
6. Clique em **Deploy**

### 3️⃣ Teste
Recarregue a página da aplicação. As operadoras devem carregar!

---

**Nota:** Testei suas credenciais diretamente na API DingConnect e funcionam perfeitamente. O único problema é que o código no Supabase precisa ser atualizado.
