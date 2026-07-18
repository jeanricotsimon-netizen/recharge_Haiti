import { useState } from 'react';
import { RechargeData, Transaction } from '../types';
import { mercadopagoService } from '../services/mercadopago';
import { supabaseService } from '../services/supabase';
import { pendingRechargeStorage } from '../services/pendingRecharge';
import { getProfitMarginFee, getDingConnectAmount, HAITI_OPERATORS, DOMINICAN_OPERATORS, BRAZIL_OPERATORS, getCurrencyForCountry } from '../constants/countries';

export const useRecharge = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const processRecharge = async (
    rechargeData: RechargeData,
    userEmail: string,
    sessionId?: string
  ): Promise<Transaction | null> => {
    if (loading) return null;

    setLoading(true);
    setError(null);

    try {
      const currency = getCurrencyForCountry(rechargeData.originCountry);
      const customerPaidAmount = rechargeData.amount;
      const profitFee = getProfitMarginFee(currency, customerPaidAmount);
      const totalPaymentAmount = customerPaidAmount;

      // Haiti & Rep. Dominicana: mantém 80% (lógica original)
      // Brasil: usa valores fixos dos pacotes do CSV (sendAmount)
      const isBrazil = rechargeData.operator.startsWith('BR_');
      let dingconnectAmount: number;
      let receiveValue: number | undefined;
      let receiveCurrencyIso: string | undefined;
      let skuCode: string | undefined;

      const operator = HAITI_OPERATORS.concat(DOMINICAN_OPERATORS, BRAZIL_OPERATORS).find(op => op.id === rechargeData.operator);

      if (isBrazil) {
        // Brasil: encontra o pacote exato no CSV (sendAmount = receiveAmount + comissão)
        const product = operator?.products?.find(p => p.sendAmount === customerPaidAmount);
        if (!product) {
          throw new Error('Pacote de recarga inválido. Selecione um valor disponível.');
        }
        dingconnectAmount = product.receiveAmount;
        receiveValue = product.receiveAmount;
        receiveCurrencyIso = product.receiveCurrencyIso;
        skuCode = product.skuCode;
      } else {
        // Haiti / Rep. Dominicana: mantém 80% como antes
        if (currency === 'BRL') {
          dingconnectAmount = getDingConnectAmount(currency, customerPaidAmount);
        } else {
          dingconnectAmount = customerPaidAmount;
        }
      }

      const minBrlAmount = operator?.minAmountBRL || 10.00;
      const maxBrlAmount = operator?.maxAmountBRL || 750.00;

      if (customerPaidAmount < minBrlAmount || customerPaidAmount > maxBrlAmount) {
        throw new Error(`Valor invalido. Use valores entre R$ ${minBrlAmount.toFixed(2)} e R$ ${maxBrlAmount.toFixed(2)}.`);
      }

      const txSessionId = sessionId || crypto.randomUUID();

      if (rechargeData.paymentMethod !== 'PIX') {
        setError('Apenas PIX e suportado no momento');
        return null;
      }

      // Create PIX payment FIRST so we have the payment_id before saving to DB
      const paymentResult = await mercadopagoService.createPixPayment(
        totalPaymentAmount,
        userEmail,
        rechargeData.phoneNumber,
        `Recarga ${operator?.name || rechargeData.operator}`
      );

      if (!paymentResult.success) {
        setError(paymentResult.message || 'Erro ao gerar PIX');
        return null;
      }

      // Now create transaction with payment_id already set — webhook can find it immediately
      const transaction = await supabaseService.createTransaction({
        userId: undefined,
        phoneNumber: rechargeData.phoneNumber,
        operator: rechargeData.operator,
        operatorName: operator?.name || '',
        amount: totalPaymentAmount,
        currency: currency,
        countryFrom: rechargeData.originCountry,
        countryTo: isBrazil ? 'BR' : (rechargeData.operator.includes('DO') ? 'DO' : 'HT'),
        status: 'pending',
        paymentMethod: rechargeData.paymentMethod,
        paymentId: paymentResult.paymentId,
        receiveValue: receiveValue,
        receiveCurrencyIso: receiveCurrencyIso,
        distributorRef: skuCode
      });

      pendingRechargeStorage.save({
        transactionId: transaction.id,
        paymentId: paymentResult.paymentId!,
        rechargeData,
        sessionId: txSessionId,
        totalAmount: totalPaymentAmount,
        dingconnectAmount: dingconnectAmount,
        createdAt: new Date().toISOString(),
      });

      setPaymentData({
        ...paymentResult,
        transactionId: transaction.id,
        rechargeData,
        totalAmount: totalPaymentAmount,
        dingconnectAmount: dingconnectAmount,
      });

      return transaction;
    } catch (err) {
      console.error('useRecharge error:', err);
      const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    processRecharge,
    loading,
    error,
    setError,
    paymentData,
    setPaymentData
  };
};
