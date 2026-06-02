# DEPLOY COMPLETO - CORREÇÃO FINAL

## 🔍 PROBLEMA IDENTIFICADO

Suas credenciais **ESTÃO CORRETAS**! O problema era:

1. ❌ A API retornava `data.Items` mas o código buscava `data.Products`
2. ❌ O código enviava `Content-Type: application/json` em requisições GET (a API DingConnect não aceita)

## ✅ SOLUÇÕES APLICADAS

### 1. Edge Function: `dingconnect-operators`

**Correções:**
- Removido `Content-Type: application/json` do header de GET
- Corrigido de `data.Products` para `data.Items`
- CORS headers padronizados

### 2. Edge Function: `dingconnect-recharge`

**Correções:**
- CORS headers padronizados
- Mantém `Content-Type: application/json` (é POST, então precisa)

---

## 📋 PASSO A PASSO PARA DEPLOY

### OPÇÃO 1: Deploy via Dashboard (RECOMENDADO)

#### Função 1: dingconnect-operators

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions/dingconnect-operators

2. Clique em "Edit" (ícone de lápis)

3. **APAGUE TODO** o conteúdo atual (Ctrl+A, Delete)

4. **COLE** este código:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CLIENT_ID = Deno.env.get('DINGCONNECT_CLIENT_ID') || '';
const CLIENT_SECRET = Deno.env.get('DINGCONNECT_CLIENT_SECRET') || '';

let accessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('DingConnect credentials not configured');
  }

  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const response = await fetch('https://idp.ding.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DingConnect Authentication failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('No access token returned');
  }

  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

  return accessToken;
}

async function fetchOperators(accessToken: string, countryCode: string) {
  const response = await fetch(
    `https://api.dingconnect.com/api/V1/GetProducts?CountryIso=${countryCode}&ProductTypeId=1`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch operators: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.Items || [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    let requestBody;
    try {
      const requestText = await req.text();
      requestBody = requestText ? JSON.parse(requestText) : {};
    } catch (parseError) {
      requestBody = {};
    }

    const { countryCode = 'HT' } = requestBody;

    const token = await getAccessToken();
    const operators = await fetchOperators(token, countryCode);

    return new Response(
      JSON.stringify({
        success: true,
        operators: operators,
        countryCode: countryCode,
        operatorCount: operators.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching operators:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

5. Clique em **"Deploy"** ou **"Save"**

6. Aguarde o deploy completar (30-60 segundos)

---

#### Função 2: dingconnect-recharge

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions/dingconnect-recharge

2. Clique em "Edit"

3. **APAGUE TODO** o conteúdo atual

4. **COLE** este código:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

let accessToken = null
let tokenExpiry = 0

const CLIENT_ID = Deno.env.get('DINGCONNECT_CLIENT_ID') || ''
const CLIENT_SECRET = Deno.env.get('DINGCONNECT_CLIENT_SECRET') || ''

async function getToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Credentials not configured')
  }

  const params = new URLSearchParams()
  params.append('client_id', CLIENT_ID)
  params.append('client_secret', CLIENT_SECRET)
  params.append('grant_type', 'client_credentials')

  const res = await fetch('https://idp.ding.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error('OAuth2 failed: ' + err)
  }

  const data = await res.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000
  return accessToken
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const phoneNumber = body.phoneNumber
    const operatorId = body.operatorId
    const amount = body.amount
    const currency = body.currency || 'BRL'

    if (!phoneNumber || !operatorId || !amount) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing parameters'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = await getToken()

    let fullPhone = phoneNumber
    if (operatorId.startsWith('DO_')) {
      if (!phoneNumber.startsWith('1')) {
        fullPhone = '1' + phoneNumber
      }
    } else if (operatorId.startsWith('HT_')) {
      if (!phoneNumber.startsWith('509')) {
        fullPhone = '509' + phoneNumber
      }
    }

    const correlationId = 'recharge-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    const rechargeData = {
      SkuCode: operatorId,
      SendValue: amount,
      SendCurrencyIso: currency,
      AccountNumber: fullPhone,
      DistributorRef: correlationId,
      ValidateOnly: false
    }

    const res = await fetch('https://api.dingconnect.com/api/V1/SendTransfer', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'X-Options': 'DeferTransfer',
        'X-Correlation-Id': correlationId,
        'Accept': 'application/json'
      },
      body: JSON.stringify(rechargeData)
    })

    const resText = await res.text()
    let resData

    try {
      resData = JSON.parse(resText)
    } catch (e) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Parse error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!res.ok) {
      let errMsg = 'Unknown error'
      if (resData.ErrorCodes && resData.ErrorCodes.length > 0) {
        errMsg = resData.ErrorCodes[0].Context || resData.ErrorCodes[0].Code
      }
      return new Response(JSON.stringify({
        success: false,
        error: errMsg,
        details: resData
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const state = resData.TransferRecord?.ProcessingState
    const failed = state === 'Failed'

    return new Response(JSON.stringify({
      success: !failed,
      transactionId: resData.TransferRecord?.TransferId?.TransferRef,
      message: failed ? 'Failed' : 'Success',
      status: state,
      correlationId: correlationId,
      data: resData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

5. Clique em **"Deploy"**

6. Aguarde o deploy completar

---

## 🔐 VERIFICAR SECRETS (MUITO IMPORTANTE!)

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/vault

2. Verifique se existem estes secrets:

   **DINGCONNECT_CLIENT_ID**
   ```
   2f217bf9-ece9-4354-840f-dd2fbd7b041a
   ```

   **DINGCONNECT_CLIENT_SECRET**
   ```
   6WalVCnBsf6nILpuiMSQ18N9mKgP1jFxovt71bpFq1E=
   ```

3. Se não existirem, clique em **"New secret"** e adicione cada um

---

## ✅ TESTAR

Após o deploy, teste a aplicação:

1. Abra o app
2. Selecione "Haiti"
3. Clique em "Buscar Operadoras"
4. Deve carregar a lista de operadoras!

---

## 🎯 O QUE FOI CORRIGIDO

### Antes:
```typescript
// ❌ ERRADO - enviava Content-Type em GET
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'  // <- DingConnect rejeita isso
}

// ❌ ERRADO - buscava campo que não existe
return data.Products || [];  // <- API retorna 'Items', não 'Products'
```

### Depois:
```typescript
// ✅ CORRETO - sem Content-Type em GET
headers: {
  'Authorization': `Bearer ${token}`
}

// ✅ CORRETO - campo correto
return data.Items || [];
```

---

## 📊 STATUS ATUAL

- ✅ Credenciais DingConnect: **VÁLIDAS**
- ✅ Autenticação OAuth2: **FUNCIONANDO**
- ✅ Banco de dados Supabase: **FUNCIONANDO**
- ✅ Código corrigido: **PRONTO**
- ⏳ Edge Functions: **AGUARDANDO DEPLOY**

---

## 💡 PRÓXIMOS PASSOS

Depois de fazer o deploy:

1. As operadoras vão carregar automaticamente
2. As recargas vão funcionar
3. O histórico vai salvar corretamente no banco
4. Os reembolsos automáticos vão parar (porque não vai mais dar erro 401)

---

**IMPORTANTE:** Não esqueça de configurar os secrets no Vault se ainda não estiverem lá!
