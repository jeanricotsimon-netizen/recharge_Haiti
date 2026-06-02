import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { paymentId } = await req.json()

    if (!paymentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MISSING_PAYMENT_ID',
          status: 'failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const rawToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const accessToken = (rawToken && (rawToken.startsWith('APP_USR-') || rawToken.startsWith('TEST-')) && rawToken.length >= 20)
      ? rawToken
      : 'TEST-5413112594519532-070307-6ebafa655675f547489f14d69a7bfa62-156425199'

    if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-')) || accessToken.length < 20) {
      console.error('🚨 MercadoPago Status: Token não configurado!')
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MERCADOPAGO_NOT_CONFIGURED',
          status: 'failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const isTestMode = accessToken.startsWith('TEST-')
    
    if (isTestMode) {
      console.log('🧪 MercadoPago Status: Verificando status (TESTE):', paymentId)
    } else {
      console.log('💳 MercadoPago Status: Verificando status (PRODUÇÃO):', paymentId)
    }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('MercadoPago status API error:', {
        status: response.status,
        data: responseData,
        paymentId
      })
      
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData.cause?.[0]?.code || 'STATUS_CHECK_FAILED',
          status: 'failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('MercadoPago status retrieved:', {
      id: responseData.id,
      status: responseData.status,
      statusDetail: responseData.status_detail
    })

    return new Response(
      JSON.stringify({
        success: true,
        status: responseData.status,
        paymentId: responseData.id?.toString(),
        statusDetail: responseData.status_detail,
        productionMode: !isTestMode,
        testMode: isTestMode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error checking payment status:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API_ERROR',
        status: 'failed',
        message: error.message || 'Erro ao verificar status do pagamento'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})