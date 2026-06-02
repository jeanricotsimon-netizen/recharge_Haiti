import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-correlation-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔔 DingConnect Webhook: Recebendo notificação...')
    
    // Get correlation ID from header
    const correlationId = req.headers.get('X-Correlation-Id')
    console.log('🔗 Correlation ID:', correlationId)
    
    const webhookData = await req.json()
    
    console.log('📥 DingConnect Webhook: Dados recebidos:', {
      correlationId,
      transferRef: webhookData.TransferRecord?.TransferId?.TransferRef,
      distributorRef: webhookData.TransferRecord?.TransferId?.DistributorRef,
      processingState: webhookData.TransferRecord?.ProcessingState,
      resultCode: webhookData.ResultCode,
      hasErrorCodes: !!webhookData.ErrorCodes?.length,
      timestamp: new Date().toISOString()
    })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Find transaction by DistributorRef (correlation ID)
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('*')  
      .or(`payment_id.eq.${webhookData.TransferRecord?.TransferId?.DistributorRef},ding_transaction_id.eq.${webhookData.TransferRecord?.TransferId?.TransferRef},ding_transaction_id.eq.${correlationId}`)
      .limit(1)

    if (fetchError) {
      console.error('❌ Erro ao buscar transação:', fetchError)
      return new Response('ok', { headers: corsHeaders })
    }

    if (!transactions || transactions.length === 0) {
      console.warn('⚠️ Transação não encontrada para DistributorRef:', webhookData.TransferRecord?.TransferId?.DistributorRef)
      console.warn('⚠️ Ou TransferRef:', webhookData.TransferRecord?.TransferId?.TransferRef)
      return new Response('ok', { headers: corsHeaders })
    }

    const transaction = transactions[0]
    console.log('✅ Transação encontrada:', transaction.id)

    // Determine final status based on ProcessingState
    let finalStatus = 'processing'
    let errorMessage = null

    if (webhookData.TransferRecord?.ProcessingState === 'Complete') {
      finalStatus = 'success'
      console.log('✅ DingConnect: Recarga completada com sucesso')
    } else if (webhookData.TransferRecord?.ProcessingState === 'Failed') {
      finalStatus = 'failed'
      
      // Extract error message
      if (webhookData.ErrorCodes && webhookData.ErrorCodes.length > 0) {
        const firstError = webhookData.ErrorCodes[0]
        errorMessage = firstError.Context || `Erro ${firstError.Code}`
      } else {
        errorMessage = `Recarga falhou - ProcessingState: ${webhookData.TransferRecord?.ProcessingState}`
      }
      
      console.log('❌ DingConnect: Recarga falhou:', errorMessage)
    } else if (webhookData.TransferRecord?.ProcessingState === 'Cancelled') {
      finalStatus = 'failed'
      errorMessage = 'Recarga cancelada pelo provedor'
      console.log('⚠️ DingConnect: Recarga cancelada')
    } else {
      console.log('🔄 DingConnect: Estado intermediário:', webhookData.TransferRecord?.ProcessingState)
    }

    // Update transaction in database
    const updateData: any = {
      status: finalStatus,
      ding_transaction_id: webhookData.TransferRecord?.TransferId?.TransferRef,
      updated_at: new Date().toISOString()
    }

    if (errorMessage) {
      updateData.failure_reason = errorMessage
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transaction.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar transação:', updateError)
    } else {
      console.log('✅ Transação atualizada:', {
        id: transaction.id,
        status: finalStatus,
        transferRef: webhookData.TransferRecord?.TransferId?.TransferRef,
        errorMessage
      })
    }

    // If the recharge failed, we should initiate a refund
    if (finalStatus === 'failed' && transaction.payment_id) {
      console.log('💰 Iniciando reembolso automático para recarga falhada...')

      try {
        const refundUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-refund`

        const refundResponse = await fetch(refundUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: transaction.payment_id,
            amount: transaction.amount_usd
          })
        })

        const refundData = await refundResponse.json()

        if (refundResponse.ok && refundData.success) {
          console.log('✅ Reembolso processado com sucesso')
          
          await supabase
            .from('transactions')
            .update({
              status: 'refunded',
              refund_id: refundData.paymentId,
              failure_reason: `${errorMessage}. Reembolso processado automaticamente.`,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id)
        } else {
          console.error('❌ Falha no reembolso:', refundData)
          
          await supabase
            .from('transactions')
            .update({
              failure_reason: `${errorMessage}. Erro no reembolso: ${refundData.message || 'Erro desconhecido'}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id)
        }
      } catch (refundError) {
        console.error('❌ Erro crítico no reembolso:', refundError)
        
        await supabase
          .from('transactions')
          .update({
            failure_reason: `${errorMessage}. Erro crítico no reembolso: ${refundError.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.id)
      }
    }

    return new Response('ok', { headers: corsHeaders })
  } catch (error) {
    console.error('❌ DingConnect Webhook: Erro no processamento:', error)
    return new Response('ok', { headers: corsHeaders })
  }
})