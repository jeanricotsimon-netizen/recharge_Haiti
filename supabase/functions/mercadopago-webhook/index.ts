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
  // Strip all non-digit characters before building the full number
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  let fullPhone = digitsOnly
  if (operatorId.startsWith('DO_') || operatorId === 'ORDO' || operatorId === 'VVDO' || operatorId === 'D8DO' || operatorId === 'CLDO') {
    if (!digitsOnly.startsWith('1')) fullPhone = '1' + digitsOnly
  } else if (operatorId.startsWith('BR_')) {
    if (!digitsOnly.startsWith('55')) fullPhone = '55' + digitsOnly
  } else {
    if (!digitsOnly.startsWith('509')) fullPhone = '509' + digitsOnly
  }

  // Para Brasil, usar o SkuCode exato do pacote (distributor_ref) se fornecido
  // Para Haiti/Rep. Dom., operatorId já é o SkuCode
  const effectiveSkuCode = skuCode || operatorId

  const correlationId = 'webhook-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)

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

  // Extract error codes from both HTTP errors and HTTP 200 with ErrorCodes
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
  // Retry up to 3 times with delay — MercadoPago sometimes needs a moment after approval
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000))

      const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      })

      const resText = await res.text()
      console.log(`Refund attempt ${attempt}:`, { status: res.status, paymentId, amount, body: resText })

      if (res.ok) return true

      // 422 = already refunded or refund not applicable — treat as success
      if (res.status === 422) {
        console.log('Refund 422 — already refunded or not applicable, treating as success')
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
    const webhookData = await req.json()

    console.log('Webhook received:', { type: webhookData.type, action: webhookData.action, dataId: webhookData.data?.id })

    if (webhookData.type !== 'payment') {
      return new Response('ok', { headers: corsHeaders })
    }

    const paymentId = webhookData.data?.id
    if (!paymentId) return new Response('ok', { headers: corsHeaders })

    const rawToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    const accessToken = (rawToken && (rawToken.startsWith('APP_USR-') || rawToken.startsWith('TEST-')) && rawToken.length >= 20)
      ? rawToken
      : 'TEST-5413112594519532-070307-6ebafa655675f547489f14d69a7bfa62-156425199'
    if (!accessToken) {
      console.error('No MERCADOPAGO_ACCESS_TOKEN configured')
      return new Response('ok', { headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Simulate approved payment for testing — skip real MercadoPago verification
    const isSimulation = webhookData._simulate_approved === true
    if (!isSimulation) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
      })

      if (!paymentResponse.ok) {
        console.error('Failed to fetch payment from MercadoPago')
        return new Response('ok', { headers: corsHeaders })
      }

      const paymentData = await paymentResponse.json()
      console.log('Payment status:', { id: paymentData.id, status: paymentData.status })

      if (paymentData.status !== 'approved') {
        return new Response('ok', { headers: corsHeaders })
      }
    } else {
      console.log('TEST MODE: simulating approved payment for paymentId:', paymentId)
    }

    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('payment_id', paymentId.toString())
      .limit(1)

    if (fetchError || !transactions || transactions.length === 0) {
      console.error('Transaction not found for payment_id:', paymentId)
      return new Response('ok', { headers: corsHeaders })
    }

    const transaction = transactions[0]

    // Skip only truly terminal states — never skip 'processing' since it may be a stale/stuck state
    if (['success', 'refunded'].includes(transaction.status)) {
      console.log('Transaction already completed, skipping:', transaction.id, transaction.status)
      return new Response('ok', { headers: corsHeaders })
    }

    // Mark as processing to prevent duplicate recharge from frontend
    await supabase
      .from('transactions')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', transaction.id)
      .eq('status', transaction.status) // optimistic lock

    console.log('Processing recharge for transaction:', transaction.id, {
      phone: transaction.phone_number,
      operator: transaction.operator_id,
      amount: transaction.amount,
      currency: transaction.currency
    })

    const customerAmount: number = Number(transaction.amount)
    const isBrazil = (transaction.operator_id || '').startsWith('BR_')
    // Brasil: usa receive_value já armazenado (pacote fixo do CSV)
    // Haiti/Rep. Dom.: mantém 80% como antes
    const dingAmount = isBrazil
      ? Number(transaction.receive_value)
      : Math.round(customerAmount * 0.80 * 100) / 100
    const dingSendCurrency = transaction.currency || 'BRL'

    const rechargeResult = await performDingConnectRecharge(
      transaction.phone_number,
      transaction.operator_id,
      dingAmount,
      dingSendCurrency,
      isBrazil ? transaction.distributor_ref : undefined
    )

    console.log('DingConnect result:', rechargeResult)

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
        .eq('id', transaction.id)

      console.log('Recharge successful:', transaction.id)
    } else {
      console.error('Recharge failed, initiating refund:', rechargeResult.error)

      const refunded = await processRefund(paymentId.toString(), customerAmount, accessToken)

      await supabase
        .from('transactions')
        .update({
          status: refunded ? 'refunded' : 'failed',
          failure_reason: `Recharge failed: ${rechargeResult.error}. Refund ${refunded ? 'processed' : 'failed'}.`,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.id)

      console.log('Transaction updated after failed recharge:', { refunded, transactionId: transaction.id })
    }

    return new Response('ok', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('ok', { headers: corsHeaders })
  }
})
