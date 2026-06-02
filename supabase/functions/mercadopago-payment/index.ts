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
    const { amount, email, phoneNumber, description } = await req.json()

    const rawToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    // Fall back to test token when secret is not yet updated
    const accessToken = (rawToken && (rawToken.startsWith('APP_USR-') || rawToken.startsWith('TEST-')) && rawToken.length >= 20)
      ? rawToken
      : 'TEST-5413112594519532-070307-6ebafa655675f547489f14d69a7bfa62-156425199'

    if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-')) || accessToken.length < 20) {
      console.error('MercadoPago Edge Function: Token nao configurado!')
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MERCADOPAGO_NOT_CONFIGURED',
          message: 'Token MercadoPago não configurado. Use token que comece com APP_USR- (produção) ou TEST- (teste)',
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
      console.log('🧪 MercadoPago Edge Function: Modo TESTE ativado - Sem cobrança real')
    } else {
      console.log('🚨 MercadoPago Edge Function: Modo PRODUÇÃO ativado - Cobranças reais')
    }

    // Get Supabase URL for webhook notification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    
    if (!supabaseUrl) {
      console.error('🚨 MercadoPago Edge Function: SUPABASE_URL não configurado!')
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SUPABASE_URL_NOT_CONFIGURED',
          message: 'SUPABASE_URL não configurado nas variáveis de ambiente',
          status: 'failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paymentData = {
      transaction_amount: amount,
      description: description || 'Recarga Haiti',
      payment_method_id: 'pix',
      payer: {
        email: email
      },
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      external_reference: `recharge_${Date.now()}_${phoneNumber}`,
      metadata: {
        phone_number: phoneNumber,
        service: 'recharge_haiti',
        timestamp: Date.now().toString()
      }
    }

    console.log('Sending payment request to MercadoPago:', {
      amount: paymentData.transaction_amount,
      email: paymentData.payer.email,
      reference: paymentData.external_reference
    })

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `recharge_${Date.now()}_${Math.random()}`
      },
      body: JSON.stringify(paymentData)
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error('MercadoPago API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        tokenPresent: !!accessToken,
        tokenLength: accessToken?.length
      })
      
      return new Response(
        JSON.stringify({
          success: false,
          error: responseData.cause?.[0]?.code || responseData.error || 'PAYMENT_FAILED',
          message: responseData.message || 'Erro na API do MercadoPago',
          details: responseData.cause || [],
          raw: responseData,
          status: 'failed'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('MercadoPago payment created successfully:', {
      id: responseData.id,
      status: responseData.status,
      hasQrCode: !!responseData.point_of_interaction?.transaction_data?.qr_code,
      hasQrCodeBase64: !!responseData.point_of_interaction?.transaction_data?.qr_code_base64,
      qrCodeLength: responseData.point_of_interaction?.transaction_data?.qr_code_base64?.length || 0,
      qrCodePreview: responseData.point_of_interaction?.transaction_data?.qr_code_base64?.substring(0, 100) || 'none'
    })

    const qrCodeBase64 = responseData.point_of_interaction?.transaction_data?.qr_code_base64
    const qrCode = responseData.point_of_interaction?.transaction_data?.qr_code
    
    // Validate QR code data
    if (!qrCodeBase64 && !qrCode) {
      console.warn('No QR code data received from MercadoPago')
    }
    
    if (qrCodeBase64 && !qrCodeBase64.startsWith('data:image/')) {
      console.warn('QR code base64 does not start with data:image/')
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: responseData.id?.toString(),
        status: responseData.status,
        qrCode: responseData.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: responseData.point_of_interaction?.transaction_data?.qr_code_base64,
        qrCodeUrl: responseData.point_of_interaction?.transaction_data?.ticket_url,
        productionMode: !isTestMode,
        testMode: isTestMode
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('MercadoPago payment function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'FUNCTION_ERROR',
        message: error.message || 'Erro interno do servidor',
        status: 'failed'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})