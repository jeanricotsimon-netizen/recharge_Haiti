import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange
}) => {
  const { t } = useLanguage();

  // Auto-select Brazil as origin if no country is selected
  React.useEffect(() => {
    if (!selectedCountry) {
      onCountryChange('BR');
    }
  }, [selectedCountry, onCountryChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{t.recharge.originCountry}</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🇧🇷</span>
          <div>
            <div className="font-semibold text-blue-800">{t.recharge.brazil}</div>
            <div className="text-sm text-blue-600">
              {t.recharge.currency}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              {t.recharge.method}: {t.recharge.pixInstant}
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-green-100 rounded text-sm text-green-800">
          ✅ <strong>PIX:</strong> {t.recharge.pixBenefit}
        </div>
      </div>


<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-600 text-center">
          💡 <strong>{t.recharge.nextStep}</strong>
        </p>
      </div>
    </div>
  );
};