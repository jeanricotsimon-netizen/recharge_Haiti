import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DINGCONNECT_API_KEY = Deno.env.get('DINGCONNECT_API_KEY') || '2SONug0Yxtz5yBEyVDz4LY'

async function performDingConnectRecharge(
  phoneNumber: string,
  operatorId: string,
  amount: number,
  currency: string,
  skuCode?: string
): Promise<{ success: boolean; transactionId?: string; receiveValue?: number; receiveCurrency?: string; error?: string }> {
  const cleanPhone = phoneNumber.replace(/[-\s]/g, '')
  let fullPhone = cleanPhone
  if (operatorId.startsWith('DO_')) {
    if (!cleanPhone.startsWith('1')) fullPhone = '1' + cleanPhone
  } else if (operatorId.startsWith('BR_')) {
    if (!cleanPhone.startsWith('55')) fullPhone = '55' + cleanPhone
  } else {
    if (!cleanPhone.startsWith('509')) fullPhone = '509' + cleanPhone
  }

  // Para Brasil, usar o SkuCode exato do pacote (distributor_ref) se fornecido
  // Para Haiti/Rep. Dom., operatorId já é o SkuCode
  const effectiveSkuCode = skuCode || operatorId

  const correlationId = 'recover-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

  const res = await fetch('https://api.dingconnect.com/api/V1/SendTransfer', {
    method: 'POST',
    headers: {
      'api_key': DINGCONNECT_API_KEY,
      'Content-Type': 'application/json',
      'X-Correlation-Id': correlationId,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      SkuCode: effectiveSkuCode,
      SendValue: amount,
      SendCurrencyIso: currency,
      AccountNumber: fullPhone,
      DistributorRef: correlationId,
      ValidateOnly: false
    })
  })

  const resText = await res.text()
  let resData: any
  try { resData = JSON.parse(resText) } catch { return { success: false, error: 'Parse error from DingConnect' } }

  const errorCodes = resData.ErrorCodes || []
  const errorMsg = errorCodes.length > 0
    ? errorCodes.map((e: any) => e.Context || e.Code).join(', ')
    : null

  if (!res.ok) {
    console.error('DingConnect HTTP error:', { status: res.status, errorMsg, body: resText })
    return { success: false, error: errorMsg || 'DingConnect error' }
  }

  const state = resData.TransferRecord?.ProcessingState
  const isSuccess = state === 'Complete' || state === 'Submitted'
  const isFailed = state === 'Failed' || (!state && errorCodes.length > 0)

  const rawReceiveValue: number = resData.TransferRecord?.Price?.ReceiveValue
  const rawReceiveCurrency: string = resData.TransferRecord?.Price?.ReceiveCurrencyIso

  const displayReceiveValue = rawReceiveValue != null
    ? Math.round(rawReceiveValue * 100) / 100
    : undefined

  console.log('DingConnect result:', {
    state,
    isSuccess,
    errorMsg,
    operatorId,
    phone: phoneNumber,
    amountSent: amount,
    currency,
    receiveValue: displayReceiveValue,
    receiveCurrency: rawReceiveCurrency
  })

  if (isFailed || !isSuccess) {
    const reason = errorMsg || `Transfer state: ${state}`
    return { success: false, error: reason }
  }

  return {
    success: true,
    transactionId: resData.TransferRecord?.TransferId?.TransferRef,
    receiveValue: displayReceiveValue,
    receiveCurrency: rawReceiveCurrency
  }
}

async function processRefund(paymentId: string, amount: number, accessToken: string): Promise<boolean> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000))

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(amount.toFixed(2)) })
      })

      const resText = await res.text()
      console.log(`Refund attempt ${attempt}:`, { status: res.status, paymentId, amount, body: resText })

      if (res.ok) return true

      // 422 = already refunded or not applicable — treat as success
      if (res.status === 422) {
        console.log('Refund 422 — already refunded, treating as success')
        return true
      }
    } catch (e) {
      console.error(`Refund attempt ${attempt} error:`, e)
    }
  }
  return false
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const { transactionId, paymentId, forceApproved } = await req.json()

    if (!transactionId || !paymentId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing transactionId or paymentId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const rawToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const accessToken = (rawToken && (rawToken.startsWith('APP_USR-') || rawToken.startsWith('TEST-')) && rawToken.length >= 20)
      ? rawToken
      : 'TEST-5413112594519532-070307-6ebafa655675f547489f14d69a7bfa62-156425199'
    if (!accessToken) {
      return new Response(JSON.stringify({ success: false, error: 'Payment provider not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle()

    if (txError || !transaction) {
      return new Response(JSON.stringify({ success: false, error: 'Transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Already terminal — nothing to do
    if (transaction.status === 'success' || transaction.status === 'refunded') {
      return new Response(JSON.stringify({ success: true, status: transaction.status, alreadyDone: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!forceApproved) {
      // Verify payment is actually approved in MercadoPago before doing anything
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      })

      if (!mpRes.ok) {
        return new Response(JSON.stringify({ success: false, error: 'Could not verify payment status' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const mpPayment = await mpRes.json()
      console.log('MercadoPago payment status for recovery:', { id: mpPayment.id, status: mpPayment.status })

      if (mpPayment.status !== 'approved') {
        return new Response(JSON.stringify({ success: false, error: `Payment not approved (status: ${mpPayment.status})` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      console.log('forceApproved=true — skipping MercadoPago payment check (test mode)')
    }

    // Mark as processing (optimistic lock — only if still pending/processing)
    const { error: lockError } = await supabase
      .from('transactions')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', transactionId)
      .in('status', ['pending', 'processing'])

    if (lockError) {
      console.error('Lock error:', lockError)
    }

    const customerAmount: number = Number(transaction.amount)
    const isBrazil = (transaction.operator_id || '').startsWith('BR_')
    // Brasil: usa receive_value já armazenado (pacote fixo do CSV)
    // Haiti/Rep. Dom.: mantém 80% como antes
    const dingAmount = isBrazil
      ? Number(transaction.receive_value)
      : Math.round(customerAmount * 0.80 * 100) / 100
    const dingSendCurrency = transaction.currency || 'BRL'

    console.log('Performing DingConnect recharge:', {
      phone: transaction.phone_number,
      operator: transaction.operator_id,
      dingAmount,
      dingSendCurrency,
      isBrazil,
      skuCode: isBrazil ? transaction.distributor_ref : undefined
    })

    const rechargeResult = await performDingConnectRecharge(
      transaction.phone_number,
      transaction.operator_id,
      dingAmount,
      dingSendCurrency,
      isBrazil ? transaction.distributor_ref : undefined
    )

    console.log('DingConnect recovery result:', rechargeResult)

    if (rechargeResult.success) {
      await supabase
        .from('transactions')
        .update({
          status: 'success',
          ding_transaction_id: rechargeResult.transactionId ?? null,
          receive_value: rechargeResult.receiveValue ?? null,
          receive_currency_iso: rechargeResult.receiveCurrency ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      return new Response(JSON.stringify({
        success: true,
        status: 'success',
        dingTransactionId: rechargeResult.transactionId,
        receiveValue: rechargeResult.receiveValue,
        receiveCurrency: rechargeResult.receiveCurrency
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      // Recharge failed — refund
      console.error('Recovery recharge failed, refunding:', rechargeResult.error)
      const refunded = await processRefund(paymentId.toString(), customerAmount, accessToken)

      await supabase
        .from('transactions')
        .update({
          status: refunded ? 'refunded' : 'failed',
          failure_reason: `Recovery recharge failed: ${rechargeResult.error}. Refund ${refunded ? 'processed' : 'failed'}.`,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      return new Response(JSON.stringify({
        success: false,
        status: refunded ? 'refunded' : 'failed',
        error: rechargeResult.error
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Recovery error:', error)
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
