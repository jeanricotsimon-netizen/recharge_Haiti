import React, { useState, useEffect } from 'react';
import { CountrySelector } from '../components/CountrySelector';
import { DestinationCountrySelector } from '../components/DestinationCountrySelector';
import { PhoneInput } from '../components/PhoneInput';
import { OperatorSelector } from '../components/OperatorSelector';
import { AmountSelector } from '../components/AmountSelector';
import { PaymentMethod } from '../components/PaymentMethod';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusMessage } from '../components/StatusMessage';
import { PaymentProcessor } from '../components/PaymentProcessor';
import { useRecharge } from '../hooks/useRecharge';
import { supabaseService } from '../services/supabase';
import { pendingRechargeStorage } from '../services/pendingRecharge';
import { RechargeData } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle, RefreshCw, XCircle, Home, Copy } from 'lucide-react';
import { getCurrencyForCountry, CURRENCY_SYMBOLS } from '../constants/countries';

const getOperatorDisplayName = (operatorId: string): string => {
  const operatorNames: { [key: string]: string } = {
    'HT_D7_TopUp': 'Digicel Haiti',
    'DBHT': 'Digicel Haiti (Prepaid Plans)',
    'HT_NM_TopUp': 'Natcom Haiti',
    'N2HT': 'Natcom Haiti Bundles',
    'DO_OR_TopUp': 'Altice (Orange)',
    'DO_VV_TopUp': 'Viva',
    'DO_CL_TopUp': 'Claro',
    'BR_CL_TopUp': 'Claro Brasil',
    'BR_IM_TopUp': 'Tim Brasil',
    'BR_VO_TopUp': 'Vivo Brasil'
  };
  return operatorNames[operatorId] || operatorId;
};

const getCountryDialCode = (operatorId: string): string => {
  if (operatorId.startsWith('BR_')) return '+55';
  if (operatorId.includes('DO')) return '+1';
  return '+509';
};

interface RechargePageProps {
  onBackToHome?: () => void;
  recoveredRecharge?: import('../services/pendingRecharge').PendingRecharge | null;
  onRecoveryConsumed?: () => void;
}

const CopyReceiptButton: React.FC<{
  result: any;
  symbol: string;
  getCountryDialCode: (op: string) => string;
  getOperatorDisplayName: (op: string) => string;
}> = ({ result, symbol, getCountryDialCode, getOperatorDisplayName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const dialCode = getCountryDialCode(result.operator);
    const countryName = dialCode === '+55' ? 'Brasil' : (dialCode === '+1' ? 'Rep. Dominicana' : 'Haiti');
    const details = `Recarga ${countryName}
Numero: ${dialCode} ${result.phoneNumber}
Operadora: ${getOperatorDisplayName(result.operator)}
Valor: ${symbol} ${Number(result.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${result.receiveValue ? `\nCredito: ${result.receiveCurrencyIso} ${Number(result.receiveValue).toFixed(2)}` : ''}
ID: ${result.dingconnectTransactionId || result.id}
Data: ${new Date(result.createdAt).toLocaleString('pt-BR')}`;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(details);
      } else {
        const ta = document.createElement('textarea');
        ta.value = details;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center justify-center gap-2 text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors"
    >
      <Copy className="h-4 w-4" />
      {copied ? 'Copiado!' : 'Copiar comprovante'}
    </button>
  );
};

export const RechargePage: React.FC<RechargePageProps> = ({ onBackToHome, recoveredRecharge, onRecoveryConsumed }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [destinationCountry, setDestinationCountry] = useState('');
  const [rechargeData, setRechargeData] = useState<RechargeData>({
    originCountry: 'BR',
    phoneNumber: '',
    operator: '',
    amount: 0,
    paymentMethod: ''
  });
  const [userEmail] = useState('demo@example.com');
  const [result, setResult] = useState<any>(null);
  const [detectedOperator, setDetectedOperator] = useState<string | null>(null);

  const {
    processRecharge,
    loading,
    error,
    setError,
    paymentData,
    setPaymentData
  } = useRecharge();

  // Resume a pending PIX payment that was interrupted (only when no active payment in progress)
  useEffect(() => {
    if (!recoveredRecharge) return;
    if (paymentData) return; // already showing a QR — don't overwrite
    setPaymentData({
      transactionId: recoveredRecharge.transactionId,
      paymentId: recoveredRecharge.paymentId,
      rechargeData: recoveredRecharge.rechargeData,
      totalAmount: recoveredRecharge.totalAmount,
      dingconnectAmount: recoveredRecharge.dingconnectAmount,
      qrCode: null,
      recovered: true,
    });
    if (onRecoveryConsumed) onRecoveryConsumed();
  }, [recoveredRecharge]);

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 3 && detectedOperator && !rechargeData.operator) {
        setRechargeData({ ...rechargeData, operator: detectedOperator });
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    await processRecharge(rechargeData, userEmail);
  };

  const handleOperatorDetected = (operatorId: string) => {
    setDetectedOperator(operatorId);
    setRechargeData({ ...rechargeData, operator: operatorId });
  };

  const handlePaymentComplete = async (success: boolean, transactionId?: string) => {
    // Always clear localStorage so stale PIX never shows recovery screen
    pendingRechargeStorage.clear();

    if (!transactionId) {
      setPaymentData(null);
      setError('Erro: transacao nao encontrada');
      return;
    }

    const txn = await supabaseService.getTransaction(transactionId);

    // PIX was never paid — transaction is still pending
    if (!success && (!txn || txn.status === 'pending' || txn.status === 'processing')) {
      setResult({ _pixExpired: true });
      setPaymentData(null);
      return;
    }

    if (txn) {
      setResult(txn);
    } else {
      setResult({
        id: transactionId,
        status: 'failed',
        phoneNumber: paymentData?.rechargeData?.phoneNumber || '',
        operator: paymentData?.rechargeData?.operator || '',
        amount: paymentData?.totalAmount || 0,
        currency: 'BRL',
        createdAt: new Date().toISOString()
      });
    }
    setPaymentData(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return destinationCountry !== '';
      case 3:
        let minLength = 8;
        if (destinationCountry === 'DO') minLength = 10;
        if (destinationCountry === 'BR') minLength = 10;
        return rechargeData.phoneNumber.replace(/\D/g, '').length >= minLength;
      case 4: return rechargeData.operator !== '';
      case 5: return rechargeData.amount > 0 && rechargeData.paymentMethod !== '';
      default: return false;
    }
  };

  const resetForm = () => {
    setResult(null);
    setPaymentData(null);
    setCurrentStep(1);
    setDestinationCountry('');
    setRechargeData({
      originCountry: 'BR',
      phoneNumber: '',
      operator: '',
      amount: 0,
      paymentMethod: ''
    });
    setDetectedOperator(null);
    setError(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CountrySelector
            selectedCountry={rechargeData.originCountry}
            onCountryChange={(country) =>
              setRechargeData({ ...rechargeData, originCountry: country })
            }
          />
        );
      case 2:
        return (
          <DestinationCountrySelector
            selectedDestination={destinationCountry}
            onDestinationChange={(destination) => {
              setDestinationCountry(destination);
              setRechargeData({ ...rechargeData, phoneNumber: '', operator: '' });
              setDetectedOperator(null);
            }}
          />
        );
      case 3:
        return (
          <PhoneInput
            phoneNumber={rechargeData.phoneNumber}
            onPhoneChange={(phone) =>
              setRechargeData({ ...rechargeData, phoneNumber: phone })
            }
            onOperatorDetected={handleOperatorDetected}
            destinationCountry={destinationCountry}
          />
        );
      case 4:
        return (
          <OperatorSelector
            selectedOperator={rechargeData.operator}
            onOperatorChange={(operator) =>
              setRechargeData({ ...rechargeData, operator })
            }
            detectedOperator={detectedOperator}
            destinationCountry={destinationCountry}
          />
        );
      case 5:
        return (
          <div className="space-y-6">
            <AmountSelector
              selectedAmount={rechargeData.amount}
              onAmountChange={(amount) =>
                setRechargeData({ ...rechargeData, amount })
              }
              operator={rechargeData.operator}
              currency={getCurrencyForCountry(rechargeData.originCountry)}
            />
            <PaymentMethod
              selectedMethod={rechargeData.paymentMethod}
              onMethodChange={(method) =>
                setRechargeData({ ...rechargeData, paymentMethod: method })
              }
              country={rechargeData.originCountry}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Show payment processor when payment is in progress
  if (paymentData && !result) {
    return (
      <div className="max-w-md mx-auto p-6">
        <PaymentProcessor
          paymentData={paymentData}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    );
  }

  // PIX expired without payment
  if (result?._pixExpired) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tempo Esgotado</h2>
          <p className="text-gray-500 mt-2">
            O PIX nao foi pago dentro do prazo. Nenhum valor foi cobrado.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 text-center">
            Deseja tentar novamente com um novo codigo PIX?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setResult(null);
              setPaymentData(null);
              setCurrentStep(5); // keep form data, just go back to confirm step
              setError(null);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              Voltar ao Inicio
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show result screen
  if (result) {
    const currency = result.currency || 'BRL';
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || 'R$';

    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Status Header */}
        <div className="text-center">
          {result.status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recarga Enviada!</h2>
              <p className="text-green-600 font-medium mt-2">
                Os creditos foram enviados com sucesso.
              </p>
            </>
          )}
          {result.status === 'refunded' && (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Reembolso Processado</h2>
              <p className="text-amber-600 font-medium mt-2">
                Seu dinheiro foi devolvido automaticamente.
              </p>
            </>
          )}
          {result.status === 'failed' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Erro no Processamento</h2>
              <p className="text-red-600 font-medium mt-2">
                Houve um problema. Entre em contato com o suporte.
              </p>
            </>
          )}
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">Detalhes</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Numero:</span>
              <span className="font-medium text-gray-900">
                {getCountryDialCode(result.operator)} {result.phoneNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Operadora:</span>
              <span className="font-medium text-gray-900">
                {getOperatorDisplayName(result.operator)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor pago:</span>
              <span className="font-medium text-gray-900">
                {symbol} {Number(result.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {result.receiveValue && result.receiveCurrencyIso && (
              <div className="flex justify-between">
                <span className="text-gray-500">Credito recebido:</span>
                <span className="font-bold text-green-600">
                  {result.receiveCurrencyIso} {Number(result.receiveValue).toFixed(2)}
                </span>
              </div>
            )}
            {result.dingconnectTransactionId && (
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-mono text-xs text-gray-600">{result.dingconnectTransactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Data:</span>
              <span className="font-medium text-gray-900">
                {new Date(result.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {result.status === 'refunded' && result.errorMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Motivo:</span> {result.errorMessage}
            </p>
          </div>
        )}

        {result.status === 'failed' && result.errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">
              <span className="font-semibold">Detalhes:</span> {result.errorMessage}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-colors font-semibold active:scale-[0.98]"
            >
              <Home className="h-5 w-5" />
              Voltar ao Inicio
            </button>
          )}

          <button
            onClick={resetForm}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Nova Recarga
          </button>

          {result.status === 'success' && (
            <CopyReceiptButton result={result} symbol={symbol} getCountryDialCode={getCountryDialCode} getOperatorDisplayName={getOperatorDisplayName} />
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !paymentData) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-16">
          <LoadingSpinner message="Preparando pagamento..." />
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="max-w-md mx-auto p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Recarga Internacional</h2>
        <p className="text-gray-500 mt-1">Passo {currentStep} de {totalSteps}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message="Erro"
          details={error}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between space-x-4">
        <button
          onClick={currentStep === 1 && onBackToHome ? onBackToHome : handlePrev}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border transition-colors ${
            currentStep === 1 && !onBackToHome
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          disabled={currentStep === 1 && !onBackToHome}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{currentStep === 1 ? 'Inicio' : 'Anterior'}</span>
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-colors font-medium ${
              canProceed()
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Proximo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || loading}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-colors font-medium ${
              canProceed() && !loading
                ? 'bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>{loading ? 'Processando...' : 'Confirmar'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
