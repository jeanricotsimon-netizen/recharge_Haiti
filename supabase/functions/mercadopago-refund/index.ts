import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const { paymentId, amount } = await req.json()

    if (!paymentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MISSING_PAYMENT_ID',
          status: 'failed',
          message: 'Payment ID e obrigatorio para processar reembolso'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (!accessToken || (!accessToken.startsWith('APP_USR-') && !accessToken.startsWith('TEST-')) || accessToken.length < 20) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'MERCADOPAGO_NOT_CONFIGURED',
          status: 'failed',
          message: 'MercadoPago nao configurado: Configure MERCADOPAGO_ACCESS_TOKEN'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const isTestMode = accessToken.startsWith('TEST-')

    if (!/^\d+$/.test(paymentId.toString())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'INVALID_PAYMENT_ID',
          status: 'failed',
          message: `Payment ID deve ser numerico: ${paymentId}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check payment status before attempting refund
    console.log('Verificando status do pagamento:', paymentId)

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      console.error('Erro ao verificar pagamento:', paymentResponse.status, errorText)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'PAYMENT_NOT_FOUND',
          status: 'failed',
          message: `Pagamento nao encontrado: ${paymentResponse.status}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const paymentData = await paymentResponse.json()
    console.log('Status do pagamento:', paymentData.status, paymentData.status_detail)

    // For test mode with pending payments, simulate refund
    if (isTestMode && (paymentData.status === 'pending' || paymentData.status === 'in_process')) {
      return new Response(
        JSON.stringify({
          success: true,
          paymentId: `refund_test_${paymentId}_${Date.now()}`,
          status: 'refunded',
          amount: amount || paymentData.transaction_amount,
          refundId: `refund_test_${paymentId}_${Date.now()}`,
          message: 'Reembolso simulado em modo teste'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Payment must be approved to refund
    if (paymentData.status !== 'approved') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'PAYMENT_NOT_REFUNDABLE',
          status: 'failed',
          message: `Pagamento nao pode ser reembolsado. Status: ${paymentData.status}`,
          currentStatus: paymentData.status
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare refund request
    const refundData: Record<string, number> = {}
    if (amount && amount > 0) {
      const numericAmount = parseFloat(amount.toString())
      if (!isNaN(numericAmount) && numericAmount > 0) {
        refundData.amount = Math.round(numericAmount * 100) / 100
      }
    }

    // Attempt refund with retry on 500 errors
    let lastError: string = ''
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Tentativa de reembolso ${attempt}/3 para pagamento ${paymentId}`)

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': `refund_${paymentId}_${Date.now()}_${attempt}`
        },
        body: JSON.stringify(refundData)
      })

      let responseData
      try {
        const responseText = await response.text()
        responseData = JSON.parse(responseText)
      } catch {
        lastError = 'Erro ao processar resposta do MercadoPago'
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000 * attempt))
          continue
        }
        return new Response(
          JSON.stringify({
            success: false,
            error: 'RESPONSE_PARSE_ERROR',
            status: 'failed',
            message: lastError
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      if (response.ok) {
        console.log('Reembolso processado com sucesso:', responseData.id)
        return new Response(
          JSON.stringify({
            success: true,
            paymentId: responseData.id?.toString(),
            status: 'refunded',
            amount: responseData.amount,
            refundId: responseData.id,
            message: 'Reembolso PIX processado automaticamente'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      // On 500 error, retry
      if (response.status >= 500 && attempt < 3) {
        console.log(`Erro ${response.status} do MercadoPago, tentando novamente em ${2 * attempt}s...`)
        lastError = responseData.message || `Erro ${response.status}`
        await new Promise(r => setTimeout(r, 2000 * attempt))
        continue
      }

      // Non-retryable error or last attempt
      const refundErrorMsg = responseData.message ||
        responseData.cause?.[0]?.description ||
        `Erro ${response.status}`

      console.error('Erro no reembolso:', response.status, refundErrorMsg)

      return new Response(
        JSON.stringify({
          success: false,
          error: responseData.cause?.[0]?.code || 'REFUND_FAILED',
          status: 'failed',
          message: `Erro no reembolso PIX: ${refundErrorMsg}`,
          details: responseData.cause || []
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'REFUND_FAILED',
        status: 'failed',
        message: `Reembolso falhou apos 3 tentativas: ${lastError}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Erro critico no reembolso:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'API_ERROR',
        status: 'failed',
        message: `Erro critico no reembolso PIX: ${error.message || 'Erro desconhecido'}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})