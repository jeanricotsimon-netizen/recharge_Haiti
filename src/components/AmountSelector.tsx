import React from 'react';
import { DollarSign } from 'lucide-react';
import { ALL_OPERATORS, CURRENCY_SYMBOLS, getProfitMarginFee, getRechargeValuesForCurrency, EXCHANGE_RATES } from '../constants/countries';
import { useLanguage } from '../i18n/LanguageContext';

interface AmountSelectorProps {
  selectedAmount: number;
  onAmountChange: (amount: number) => void;
  operator: string;
  currency: string;
}

export const AmountSelector: React.FC<AmountSelectorProps> = ({
  selectedAmount,
  onAmountChange,
  operator,
  currency
}) => {
  const { t } = useLanguage();
  const [customAmount, setCustomAmount] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  
  const selectedOperator = ALL_OPERATORS.find(op => op.id === operator);
  
  // Filter denominations based on operator support and currency conversion
  const allDenominations = getRechargeValuesForCurrency(currency);
  const exchangeRate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
  
  // Filter amounts based on operator limits and valid USD conversions
  const denominations = allDenominations.filter(amount => {
    if (selectedOperator) {
      if (currency === 'BRL') {
        // Check operator-specific BRL limits for Brazil
        const minBRL = selectedOperator.minAmountBRL || 2.78;
        const maxBRL = selectedOperator.maxAmountBRL || 552.53;
        if (amount < minBRL || amount > maxBRL) {
          return false;
        }
      } else {
        // For international currencies, convert to BRL and check limits
        const brlAmount = Math.round(amount * exchangeRate * 100) / 100;
        const minBRL = selectedOperator.minAmountBRL || 2.78;
        const maxBRL = selectedOperator.maxAmountBRL || 552.53;
        if (brlAmount < minBRL || brlAmount > maxBRL) {
          return false;
        }
      }
    }
    return true;
  });
  
  const currencySymbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || '$';
  // Não mostrar benefício ao cliente - valor total = valor selecionado
  const totalAmount = selectedAmount;

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numericValue = parseFloat(value);

    if (!isNaN(numericValue) && numericValue > 0) {
      // Validar limites da operadora (R$ 10 mínimo para garantir 70% ≥ R$ 7)
      if (selectedOperator) {
        const minBRL = selectedOperator.minAmountBRL || 10.00; // Mínimo R$ 10 (70% = R$ 7)
        const maxBRL = selectedOperator.maxAmountBRL || 750.00;

        let brlAmount = numericValue;
        if (currency !== 'BRL') {
          const exchangeRate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
          brlAmount = Math.round(numericValue * exchangeRate * 100) / 100;
        }

        if (brlAmount >= minBRL && brlAmount <= maxBRL) {
          onAmountChange(numericValue);
        }
      } else {
        onAmountChange(numericValue);
      }
    } else if (value === '') {
      onAmountChange(0);
    }
  };

  const isCustomAmountValid = () => {
    const numericValue = parseFloat(customAmount);
    if (isNaN(numericValue) || numericValue <= 0) return false;

    if (selectedOperator) {
      const minBRL = selectedOperator.minAmountBRL || 10.00; // Mínimo R$ 10 (70% = R$ 6)
      const maxBRL = selectedOperator.maxAmountBRL || 750.00;

      let brlAmount = numericValue;
      if (currency !== 'BRL') {
        const exchangeRate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
        brlAmount = Math.round(numericValue * exchangeRate * 100) / 100;
      }

      return brlAmount >= minBRL && brlAmount <= maxBRL;
    }

    return true;
  };
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{t.recharge.amountTitle || 'Valor da recarga'}</h3>
      <p className="text-sm text-gray-600">
        {t.recharge.currencyInfo || 'Valores em'} {currency}
      </p>
      
      {/* Toggle para mostrar campo personalizado */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{t.recharge.predefinedValues || 'Valores pré-definidos'}:</span>
        <button
          type="button"
          onClick={() => {
            setShowCustomInput(!showCustomInput);
            if (showCustomInput) {
              setCustomAmount('');
              onAmountChange(0);
            }
          }}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showCustomInput ? (t.recharge.usePredefined || 'Usar valores pré-definidos') : (t.recharge.useCustom || 'Inserir valor personalizado')}
        </button>
      </div>

      {showCustomInput ? (
        /* Campo de valor personalizado */
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500 text-sm ml-1">{currencySymbol}</span>
            </div>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                customAmount === '' 
                  ? 'border-gray-200 focus:border-blue-500'
                  : isCustomAmountValid()
                    ? 'border-green-500 focus:border-green-600 bg-green-50'
                    : 'border-red-500 focus:border-red-600 bg-red-50'
              }`}
            />
          </div>
          
          {customAmount !== '' && !isCustomAmountValid() && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {selectedOperator ? (
                <>
                  ❌ {t.recharge.invalidValue || 'Valor fora dos limites da operadora'}.
                  <div className="mt-1">
                    <strong>{t.recharge.limitsLabel || 'Limites'}:</strong> {currencySymbol}{(selectedOperator.minAmountBRL / (EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1)).toFixed(2)} - {currencySymbol}{(selectedOperator.maxAmountBRL / (EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1)).toFixed(2)} {currency}
                  </div>
                </>
              ) : (
                `❌ ${t.recharge.invalidValue || 'Valor inválido'}. Digite um número maior que zero.`
              )}
            </div>
          )}
          
          {customAmount !== '' && isCustomAmountValid() && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ {t.recharge.validValue || 'Valor válido'}: {currencySymbol}{parseFloat(customAmount).toLocaleString()} {currency}
            </div>
          )}
        </div>
      ) : (
        /* Grid de valores pré-definidos */
      <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
        {denominations.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              onAmountChange(amount);
              setCustomAmount('');
            }}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedAmount === amount
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div className="font-bold text-lg">{currencySymbol}{amount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{currency}</div>
            </div>
          </button>
        ))}
      </div>
      )}
      
      {selectedAmount > 0 && (
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm text-blue-700">
                <strong>{t.recharge.rechargeValue || 'Valor da recarga'}:</strong> {currencySymbol}{selectedAmount.toLocaleString()} {currency}
              </p>
              <p className="text-xs text-blue-600">
                {t.recharge.limitsLabel || 'Limites'} BRL: R$ {selectedOperator.minAmountBRL} - R$ {selectedOperator.maxAmountBRL}
              </p>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-green-800">{t.recharge.totalToPay || 'Total a pagar'}:</span>
              <span className="text-green-800">{currencySymbol}{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {selectedAmount === 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {showCustomInput ? (t.recharge.enterCustom || 'Digite um valor personalizado') : (t.recharge.selectValuePrompt || 'Selecione um valor para continuar')}
          </p>
        </div>
      )}
    </div>
  );
};