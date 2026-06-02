# 🚀 Deploy Manual - Passo a Passo

## ⚠️ IMPORTANTE: A função ainda está com código antigo!

O erro 401 confirma que você precisa fazer o deploy do código atualizado.

---

## 📋 PASSO 1: Configure os Secrets

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/vault

2. Procure por `DINGCONNECT_CLIENT_ID` e `DINGCONNECT_CLIENT_SECRET`

3. Se já existirem, clique em **Edit** e verifique os valores

4. Se não existirem, clique em **New Secret** e adicione:

**Nome:** `DINGCONNECT_CLIENT_ID`
**Valor:** `2f217bf9-ece9-4354-840f-dd2fbd7b041a`

**Nome:** `DINGCONNECT_CLIENT_SECRET`
**Valor:** `6WalVCnBsf6nILpuiMSQ18N9mKgP1jFxovt71bpFq1E=`

---

## 📋 PASSO 2: Deploy da Função dingconnect-operators

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions

2. Clique na função **dingconnect-operators**

3. Clique no botão **"Details"** ou **"Edit"**

4. Você verá um editor de código

5. **APAGUE TODO O CÓDIGO** que está lá

6. Copie o código abaixo e cole no editor:

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
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch operators: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.Products || [];
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

7. Clique em **"Deploy"** ou **"Save & Deploy"**

8. Aguarde o deploy completar (você verá uma mensagem de sucesso)

---

## 📋 PASSO 3: Repita para dingconnect-recharge

O código para essa função já está correto, mas se precisar:

1. Acesse a função **dingconnect-recharge** no dashboard
2. O código atual já está bom, você só precisa garantir que os secrets estão configurados

---

## ✅ TESTE

Depois do deploy, volte para a aplicação e tente carregar as operadoras novamente.

Se funcionar, você verá a lista de operadoras disponíveis!

---

## 🆘 Se ainda não funcionar

Verifique os logs da Edge Function:
https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/logs/edge-functions

Procure por erros de autenticação ou mensagens sobre os secrets não estarem configurados.
