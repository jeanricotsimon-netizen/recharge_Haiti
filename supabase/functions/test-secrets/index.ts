import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // DingConnect
    const DING_API_KEY = Deno.env.get('DINGCONNECT_API_KEY');
    const EXPECTED_DING_KEY = '5YtHTsX69m06rABjVismuC';
    const dingMatches = DING_API_KEY === EXPECTED_DING_KEY;

    // PayPal (verifica ambos nomes possíveis)
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_SECRET = Deno.env.get('PAYPAL_SECRET') || Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox';

    // MercadoPago
    const MP_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');

    // Testar autenticação PayPal
    let paypalAuthTest = null;
    if (PAYPAL_CLIENT_ID && PAYPAL_SECRET) {
      try {
        const PAYPAL_API_URL = PAYPAL_MODE === 'live'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

        const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
        const tokenResponse = await fetch(
          `${PAYPAL_API_URL}/v1/oauth2/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${auth}`
            },
            body: 'grant_type=client_credentials'
          }
        );

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          paypalAuthTest = {
            success: true,
            message: '✅ Autenticação bem-sucedida',
            apiUrl: PAYPAL_API_URL
          };
        } else {
          const errorData = await tokenResponse.json();
          paypalAuthTest = {
            success: false,
            message: '❌ Falha na autenticação',
            error: errorData,
            apiUrl: PAYPAL_API_URL
          };
        }
      } catch (error) {
        paypalAuthTest = {
          success: false,
          message: '❌ Erro ao testar',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    // Test DingConnect ValidateOnly to see Price structure
    let dingPriceTest = null;
    if (DING_API_KEY) {
      try {
        const correlationId = 'price-test-' + Date.now();
        const dingRes = await fetch('https://api.dingconnect.com/api/V1/SendTransfer', {
          method: 'POST',
          headers: {
            'api_key': DING_API_KEY,
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
          },
          body: JSON.stringify({
            SkuCode: 'HT_D7_TopUp',
            SendValue: 8,
            SendCurrencyIso: 'BRL',
            AccountNumber: '50900000000',
            DistributorRef: correlationId,
            ValidateOnly: true
          })
        });
        const dingData = await dingRes.json();
        dingPriceTest = {
          httpStatus: dingRes.status,
          fullPrice: dingData.TransferRecord?.Price,
          allPriceKeys: dingData.TransferRecord?.Price ? Object.keys(dingData.TransferRecord.Price) : [],
          processingState: dingData.TransferRecord?.ProcessingState,
          errorCodes: dingData.ErrorCodes
        };
      } catch (e) {
        dingPriceTest = { error: e instanceof Error ? e.message : String(e) };
      }
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      dingPriceTest,
      dingconnect: {
        configured: !!DING_API_KEY,
        matches: dingMatches,
        preview: DING_API_KEY ? DING_API_KEY.substring(0, 8) + '...' : 'NOT_SET',
        message: dingMatches ? '✅ Configurado' : !DING_API_KEY ? '❌ Não configurado' : '⚠️ Valor incorreto'
      },
      paypal: {
        configured: !!PAYPAL_CLIENT_ID && !!PAYPAL_SECRET,
        hasClientId: !!PAYPAL_CLIENT_ID,
        hasSecret: !!PAYPAL_SECRET,
        mode: PAYPAL_MODE,
        clientIdPreview: PAYPAL_CLIENT_ID ? PAYPAL_CLIENT_ID.substring(0, 20) + '...' : 'NOT_SET',
        secretPreview: PAYPAL_SECRET ? PAYPAL_SECRET.substring(0, 20) + '...' : 'NOT_SET',
        clientIdLength: PAYPAL_CLIENT_ID?.length || 0,
        secretLength: PAYPAL_SECRET?.length || 0,
        authTest: paypalAuthTest,
        message: (!!PAYPAL_CLIENT_ID && !!PAYPAL_SECRET) ? '✅ Configurado' : '❌ Não configurado'
      },
      mercadopago: {
        configured: !!MP_TOKEN,
        isTestMode: MP_TOKEN?.includes('TEST-'),
        message: !!MP_TOKEN ? '✅ Configurado' : '❌ Não configurado'
      },
      instructions: {
        message: 'Configure os secrets no Supabase Dashboard',
        url: 'https://supabase.com/dashboard/project/ptdffidlieebxxnznezy/settings/vault'
      }
    };

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});