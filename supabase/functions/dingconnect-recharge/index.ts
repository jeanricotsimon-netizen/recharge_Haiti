import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Use the correct API Key
const API_KEY = Deno.env.get('DINGCONNECT_API_KEY') || '2SONug0Yxtz5yBEyVDz4LY'

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

    let fullPhone = phoneNumber
    if (operatorId.startsWith('DO_')) {
      if (!phoneNumber.startsWith('1')) {
        fullPhone = '1' + phoneNumber
      }
    } else if (operatorId.startsWith('HT_')) {
      if (!phoneNumber.startsWith('509')) {
        fullPhone = '509' + phoneNumber
      }
    } else if (operatorId.startsWith('BR_')) {
      if (!phoneNumber.startsWith('55')) {
        fullPhone = '55' + phoneNumber
      }
    }

    // Para Brasil, usar o SkuCode exato do pacote (distributor_ref) se fornecido
    // Para Haiti/Rep. Dom., operatorId já é o SkuCode
    const skuCode = body.skuCode || operatorId

    const correlationId = 'recharge-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

    console.log('📤 Enviando recarga para DingConnect', {
      phoneNumber: fullPhone,
      operatorId,
      skuCode,
      amount,
      currency
    })

    const rechargeData = {
      SkuCode: skuCode,
      SendValue: amount,
      SendCurrencyIso: currency,
      AccountNumber: fullPhone,
      DistributorRef: correlationId,
      ValidateOnly: false
    }

    const res = await fetch('https://api.dingconnect.com/api/V1/SendTransfer', {
      method: 'POST',
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json',
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
      console.error('DingConnect HTTP error:', { status: res.status, body: JSON.stringify(resData), sentPayload: rechargeData })
      return new Response(JSON.stringify({
        success: false,
        error: errMsg,
        details: resData
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('DingConnect full response:', JSON.stringify(resData, null, 2))

    const state = resData.TransferRecord?.ProcessingState
    const isSuccess = state === 'Complete' || state === 'Submitted'
    const isFailed = state === 'Failed'

    console.log('📊 Estado da transferência:', {
      state,
      isSuccess,
      isFailed,
      transferRef: resData.TransferRecord?.TransferId?.TransferRef,
      resultCode: resData.ResultCode,
      receiveValue: resData.TransferRecord?.Price?.ReceiveValue,
      receiveCurrency: resData.TransferRecord?.Price?.ReceiveCurrencyIso
    })

    // Use receiveValue exactly as reported by DingConnect
    const rawReceiveValue: number = resData.TransferRecord?.Price?.ReceiveValue;
    const receiveCurrency: string = resData.TransferRecord?.Price?.ReceiveCurrencyIso;
    const displayReceiveValue = rawReceiveValue != null
      ? Math.round(rawReceiveValue * 100) / 100
      : undefined

    console.log('🔍 Full TransferRecord:', JSON.stringify(resData.TransferRecord, null, 2))

    return new Response(JSON.stringify({
      success: isSuccess,
      transactionId: resData.TransferRecord?.TransferId?.TransferRef,
      message: isFailed ? 'Transfer failed' : isSuccess ? 'Transfer completed successfully' : 'Transfer in progress',
      status: state,
      processingState: state,
      correlationId: correlationId,
      resultCode: resData.ResultCode,
      receiveValue: displayReceiveValue,
      receiveCurrency: receiveCurrency,
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