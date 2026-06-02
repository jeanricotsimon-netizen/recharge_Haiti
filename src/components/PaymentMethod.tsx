import React from 'react';
import { Smartphone } from 'lucide-react';
import { COUNTRIES } from '../constants/countries';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  country: string;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({
  selectedMethod,
  onMethodChange,
  country
}) => {
  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const paymentMethods = selectedCountry?.paymentMethods || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Método de pagamento</h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <button
            key={method}
            onClick={() => onMethodChange(method)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedMethod === method
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">PIX</div>
                <div className="text-sm text-gray-500">Pagamento instantâneo</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};