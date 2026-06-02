# 🖥️ Deploy via Supabase Dashboard

## ⚠️ Se você recebeu erro "Failed to load function code"

Esse erro ocorre quando você tenta copiar/colar diretamente do arquivo local. Siga estas instruções:

## Opção 1: Deploy via CLI (RECOMENDADO)

Execute este comando no terminal do projeto:

```bash
./deploy-functions.sh
```

Ou manualmente:

```bash
# 1. Instalar CLI (se necessário)
npm install -g supabase

# 2. Login
supabase login

# 3. Link do projeto
supabase link --project-ref ptdffidlieebxxnznezy

# 4. Deploy
supabase functions deploy dingconnect-recharge
supabase functions deploy dingconnect-operators
```

## Opção 2: Deploy via Dashboard (Passo a Passo)

### Para dingconnect-recharge:

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions/dingconnect-recharge

2. Clique em **"Edit Function"**

3. **APAGUE TODO O CÓDIGO EXISTENTE**

4. Cole o código abaixo (já com OAuth2 corrigido):

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

let accessToken = null
let tokenExpiry = 0

const DINGCONNECT_CLIENT_ID = Deno.env.get('DINGCONNECT_CLIENT_ID') || '';
const DINGCONNECT_CLIENT_SECRET = Deno.env.get('DINGCONNECT_CLIENT_SECRET') || '';

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    console.log('Token em cache');
    return accessToken
  }

  console.log('Obtendo token OAuth2');

  if (!DINGCONNECT_CLIENT_ID || !DINGCONNECT_CLIENT_SECRET) {
    throw new Error('DingConnect credentials not configured')
  }

  const params = new URLSearchParams();
  params.append('client_id', DINGCONNECT_CLIENT_ID);
  params.append('client_secret', DINGCONNECT_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const response = await fetch('https://idp.ding.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OAuth2 failed: ${errorText}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000

  return accessToken
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, operatorId, amount, currency = 'BRL' } = await req.json()

    if (!phoneNumber || !operatorId || !amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'Parametros obrigatorios ausentes'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Iniciando recarga', { phoneNumber, operatorId, amount })

    const token = await getAccessToken()
    console.log('Token obtido')

    let fullPhoneNumber = phoneNumber;
    if (operatorId.startsWith('DO_')) {
      if (!phoneNumber.startsWith('1')) {
        fullPhoneNumber = '1' + phoneNumber;
      }
    } else if (operatorId.startsWith('HT_')) {
      if (!phoneNumber.startsWith('509')) {
        fullPhoneNumber = '509' + phoneNumber;
      }
    }

    const correlationId = `recharge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const rechargeData = {
      SkuCode: operatorId,
      SendValue: amount,
      SendCurrencyIso: currency,
      AccountNumber: fullPhoneNumber,
      DistributorRef: correlationId,
      ValidateOnly: false,
    }

    console.log('Enviando para API', rechargeData)

    const response = await fetch('https://api.dingconnect.com/api/V1/SendTransfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Options': 'DeferTransfer',
        'X-Correlation-Id': correlationId,
        'Accept': 'application/json'
      },
      body: JSON.stringify(rechargeData)
    })

    console.log('Resposta recebida', { status: response.status })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'PARSE_ERROR',
          message: 'Erro ao processar resposta'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!response.ok) {
      console.error('API retornou erro', responseData)

      let apiErrorMsg = 'Erro desconhecido';
      if (responseData.ErrorCodes && responseData.ErrorCodes.length > 0) {
        apiErrorMsg = responseData.ErrorCodes[0].Context || `Erro ${responseData.ErrorCodes[0].Code}`;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: 'RECHARGE_FAILED',
          message: apiErrorMsg,
          details: responseData
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const processingState = responseData.TransferRecord?.ProcessingState;
    const isFailed = processingState === 'Failed';

    console.log('Recarga processada', { processingState, isFailed })

    return new Response(
      JSON.stringify({
        success: !isFailed,
        transactionId: responseData.TransferRecord?.TransferId?.TransferRef,
        message: isFailed ? 'Recarga falhou' : 'Recarga enviada com sucesso',
        status: processingState,
        correlationId: correlationId,
        dingconnectData: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erro critico:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'API_ERROR',
        message: error.message || 'Erro desconhecido'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

5. Clique em **"Save & Deploy"**

### Para dingconnect-operators:

1. Acesse: https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/functions/dingconnect-operators

2. Clique em **"Edit Function"**

3. **APAGUE TODO O CÓDIGO EXISTENTE**

4. Cole o código abaixo:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

let accessToken = null
let tokenExpiry = 0

const DINGCONNECT_CLIENT_ID = Deno.env.get('DINGCONNECT_CLIENT_ID') || '';
const DINGCONNECT_CLIENT_SECRET = Deno.env.get('DINGCONNECT_CLIENT_SECRET') || '';

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  if (!DINGCONNECT_CLIENT_ID || !DINGCONNECT_CLIENT_SECRET) {
    throw new Error('DingConnect credentials not configured')
  }

  const params = new URLSearchParams();
  params.append('client_id', DINGCONNECT_CLIENT_ID);
  params.append('client_secret', DINGCONNECT_CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const response = await fetch('https://idp.ding.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString()
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OAuth2 failed: ${errorText}`)
  }

  const data = await response.json()
  accessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000

  return accessToken
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const phoneNumber = url.searchParams.get('phoneNumber')
    const country = url.searchParams.get('country')

    if (!phoneNumber || !country) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MISSING_PARAMETERS',
          message: 'phoneNumber e country sao obrigatorios'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Buscando operadoras', { phoneNumber, country })

    const token = await getAccessToken()

    const response = await fetch(
      `https://api.dingconnect.com/api/V1/GetProviders?accountNumber=${phoneNumber}&iso2CountryCode=${country}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API_ERROR',
          message: 'Erro ao buscar operadoras',
          details: responseData
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        operators: responseData.Items || [],
        count: responseData.Items?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erro:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'SERVER_ERROR',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

5. Clique em **"Save & Deploy"**

## ✅ Verificar Deploy

Após o deploy, verifique os logs:
- https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/logs/edge-functions

Procure por mensagens como:
- "Obtendo token OAuth2"
- "Token obtido"

## 🎯 O que foi corrigido

✅ Ordem dos parâmetros OAuth2 correta (client_id, client_secret, grant_type)
✅ Código simplificado para evitar erros de parsing no Dashboard
✅ Cache de token implementado
✅ Tratamento de erros robusto
