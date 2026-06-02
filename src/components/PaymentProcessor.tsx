import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { LoadingSpinner } from './LoadingSpinner';
import { supabaseService } from '../services/supabase';
import { CURRENCY_SYMBOLS } from '../constants/countries';
import { QrCode, CheckCircle, XCircle, RefreshCw, Copy, Clock, FlaskConical } from 'lucide-react';

const IS_TEST_MODE =
  (import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '').startsWith('TEST-') ||
  import.meta.env.VITE_TEST_MODE === 'true';

interface PaymentProcessorProps {
  paymentData: any;
  onPaymentComplete: (success: boolean, transactionId?: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentData,
  onPaymentComplete
}) => {
  const [status, setStatus] = useState<'waiting' | 'processing' | 'completed' | 'failed' | 'refunded'>('waiting');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (paymentData?.qrCode) {
      generateQRCode(paymentData.qrCode);
    }
    startPolling();
    startTimer();

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            setStatus('failed');
            setTimeout(() => onPaymentComplete(false, paymentData.transactionId), 2000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const generateQRCode = async (text: string) => {
    try {
      const dataURL = await QRCode.toDataURL(text, {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
        errorCorrectionLevel: 'M'
      });
      setQrCodeImage(dataURL);
    } catch {
      setQrCodeImage(null);
    }
  };

  const startPolling = () => {
    let attempts = 0;
    const maxAttempts = 36; // 3 minutes (36 x 5s)
    let recoveryTriggered = false;

    const poll = async () => {
      if (doneRef.current) return;

      attempts++;

      // Time limit reached — stop waiting
      if (attempts > maxAttempts) {
        doneRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('failed');
        setTimeout(() => onPaymentComplete(false, paymentData.transactionId), 2000);
        return;
      }

      try {
        const txn = await supabaseService.getTransaction(paymentData.transactionId);

        if (txn) {
          if (txn.status === 'success') {
            doneRef.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            setStatus('completed');
            setTimeout(() => onPaymentComplete(true, paymentData.transactionId), 1500);
            return;
          }

          if (txn.status === 'refunded') {
            doneRef.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            setStatus('refunded');
            setTimeout(() => onPaymentComplete(false, paymentData.transactionId), 3000);
            return;
          }

          if (txn.status === 'failed') {
            doneRef.current = true;
            if (timerRef.current) clearInterval(timerRef.current);
            setStatus('failed');
            setTimeout(() => onPaymentComplete(false, paymentData.transactionId), 3000);
            return;
          }

          if (txn.status === 'processing') {
            setStatus('processing');
          }

          // After 15s of pending, try server-side recovery (webhook may not fire in sandbox)
          if (attempts >= 3 && !recoveryTriggered && (txn.status === 'pending' || txn.status === 'processing')) {
            recoveryTriggered = true;
            triggerRecovery();
          }
        }
      } catch {
        // continue polling
      }

      if (!doneRef.current) {
        pollRef.current = setTimeout(poll, 5000);
      }
    };

    pollRef.current = setTimeout(poll, 4000);
  };

  const triggerRecovery = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      await fetch(`${supabaseUrl}/functions/v1/recover-pending-recharge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: paymentData.transactionId,
          paymentId: paymentData.paymentId,
        }),
      });
    } catch {
      // silent - webhook is the primary mechanism
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currencyMap: { [key: string]: string } = {
    'BR': 'BRL', 'DO': 'BRL', 'CL': 'CLP', 'FR': 'EUR', 'MX': 'MXN', 'CA': 'CAD', 'US': 'USD'
  };
  const currency = currencyMap[paymentData?.rechargeData?.originCountry] || 'BRL';
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || 'R$';
  const totalAmount = paymentData?.totalAmount || paymentData?.rechargeData?.amount || 0;

  if (status === 'completed') {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Recarga Enviada!</h3>
        <p className="text-gray-600">
          Os creditos foram enviados com sucesso.
        </p>
      </div>
    );
  }

  if (status === 'refunded') {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <RefreshCw className="h-10 w-10 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Reembolso Processado</h3>
        <p className="text-gray-600">
          Nao foi possivel completar a recarga. Seu dinheiro foi devolvido automaticamente.
        </p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-10 space-y-4 animate-in fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Erro no Processamento</h3>
        <p className="text-gray-600">
          Houve um problema. Entre em contato com o suporte pelo WhatsApp.
        </p>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Processando Recarga...</h3>
        <p className="text-gray-600">
          Pagamento confirmado! Enviando creditos para o numero informado.
        </p>
      </div>
    );
  }

  // Waiting for PIX payment - show QR code
  if (paymentData.recovered && !paymentData.qrCode) {
    const cancelAndLeave = () => {
      doneRef.current = true;
      if (pollRef.current) clearTimeout(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      onPaymentComplete(false, paymentData.transactionId);
    };

    return (
      <div style={{ paddingBottom: '100px' }}>
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Verificando Pagamento</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Aguardando confirmacao do seu PIX. Se ja pagou, sua recarga sera processada automaticamente.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{formatTime(timeLeft)}</span>
          </div>
          <LoadingSpinner size="small" message="Verificando..." />
        </div>

        {/* Fixed bottom bar — always visible on all screen sizes */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '16px',
          zIndex: 9999,
        }}>
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '10px' }}>
            Nao pagou este PIX?
          </p>
          <button
            onClick={cancelAndLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              background: '#f3f4f6',
              color: '#374151',
              fontWeight: '600',
              fontSize: '15px',
              padding: '14px 24px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <XCircle style={{ width: '18px', height: '18px' }} />
            Sair e voltar ao inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-gray-900">Pague com PIX</h3>
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
        <p className="text-sm text-gray-500 mb-1">Valor a pagar</p>
        <p className="text-3xl font-bold text-gray-900">
          {symbol} {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {paymentData.qrCodeBase64 && paymentData.qrCodeBase64.startsWith('data:image/') ? (
          <img
            src={paymentData.qrCodeBase64}
            alt="QR Code PIX"
            className="mx-auto rounded-lg"
            style={{ width: '240px', height: '240px' }}
          />
        ) : qrCodeImage ? (
          <img
            src={qrCodeImage}
            alt="QR Code PIX"
            className="mx-auto rounded-lg"
            style={{ width: '240px', height: '240px' }}
          />
        ) : (
          <div className="flex items-center justify-center h-60">
            <LoadingSpinner size="small" message="Gerando QR Code..." />
          </div>
        )}
      </div>

      {/* Copy button */}
      {paymentData.qrCode && (
        <button
          onClick={() => copyToClipboard(paymentData.qrCode)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors active:scale-[0.98]"
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copiado!' : 'Copiar Codigo PIX'}
        </button>
      )}

      {/* Test mode button — only visible in sandbox/test environment */}
      {IS_TEST_MODE && (
        <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 bg-amber-50 space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Modo Teste</span>
          </div>
          <p className="text-xs text-amber-700">
            Simule o pagamento sem usar dinheiro real. Clique abaixo para aprovar o PIX automaticamente.
          </p>
          <button
            onClick={async () => {
              try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                await fetch(`${supabaseUrl}/functions/v1/mercadopago-webhook`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    type: 'payment',
                    action: 'payment.updated',
                    data: { id: paymentData.paymentId },
                    _simulate_approved: true,
                  }),
                });
              } catch {
                // silent — polling will pick up status change
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors active:scale-[0.98]"
          >
            <FlaskConical className="h-4 w-4" />
            Simular Pagamento Aprovado
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm font-semibold text-blue-900 mb-2">Como pagar:</p>
        <ol className="text-sm text-blue-800 space-y-1.5 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com PIX</li>
          <li>Escaneie o QR Code ou cole o codigo</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>

      {/* Guarantee */}
      <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
        <RefreshCw className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-900">Garantia de reembolso</p>
          <p className="text-xs text-green-700 mt-0.5">
            Se a recarga nao puder ser completada, seu dinheiro e devolvido automaticamente.
          </p>
        </div>
      </div>

      {/* Status indicator */}
      <div className="text-center">
        <LoadingSpinner size="small" message="Aguardando pagamento..." />
      </div>

    </div>
  );
};
