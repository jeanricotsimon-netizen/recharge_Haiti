import React, { useEffect } from 'react';
import { detectOperatorFromPhone, formatPhoneNumber, isValidHaitiNumber, isValidDominicanNumber } from '../utils/operatorDetection';

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onOperatorDetected?: (operatorId: string) => void;
  destinationCountry?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  onPhoneChange,
  onOperatorDetected,
  destinationCountry = 'HT'
}) => {
  // Usar useEffect com dependências corretas para evitar loop infinito
  useEffect(() => {
    const minLength = destinationCountry === 'DO' ? 10 : 8;
    if (phoneNumber.replace(/\D/g, '').length >= minLength && onOperatorDetected) {
      const detectedOperator = detectOperatorFromPhone(phoneNumber);
      if (detectedOperator) {
        onOperatorDetected(detectedOperator);
      }
    }
  }, [phoneNumber, destinationCountry]); // Remover onOperatorDetected das dependências para evitar loop

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove todos os caracteres não numéricos
    const cleanValue = value.replace(/\D/g, '');

    if (destinationCountry === 'HT') {
      // Haiti: Aceita 8 dígitos OU 11 dígitos se começar com 509
      if (cleanValue.startsWith('509') && cleanValue.length <= 11) {
        onPhoneChange(cleanValue);
      } else if (!cleanValue.startsWith('509') && cleanValue.length <= 8) {
        // Formatar automaticamente com hífen após 4 dígitos
        if (cleanValue.length > 4) {
          const formatted = `${cleanValue.substring(0, 4)}-${cleanValue.substring(4)}`;
          onPhoneChange(formatted);
        } else {
          onPhoneChange(cleanValue);
        }
      }
    } else if (destinationCountry === 'DO') {
      // República Dominicana: Limita a 10 dígitos (XXX-XXX-XXXX)
      if (cleanValue.length <= 10) {
        onPhoneChange(cleanValue);
      }
    }
  };

  const isValid = () => {
    if (destinationCountry === 'HT') {
      return isValidHaitiNumber(phoneNumber);
    } else if (destinationCountry === 'DO') {
      return isValidDominicanNumber(phoneNumber);
    }
    return false;
  };

  const getCountryInfo = () => {
    if (destinationCountry === 'HT') {
      return {
        flag: '🇭🇹',
        code: '+509',
        placeholder: '0000-0000',
        title: 'Número de destino no Haiti',
        description: 'Digite os 8 dígitos do número',
        minLength: 8,
        examples: {
          'Digicel': '4842-4337, 3012-3456, 4678-9012',
          'Natcom': '3223-4567, 4012-3456, 2212-3456'
        }
      };
    } else if (destinationCountry === 'DO') {
      return {
        flag: '🇩🇴',
        code: '+1',
        placeholder: '000-000-0000',
        title: 'Número de destino na República Dominicana',
        description: 'Digite o número completo (10 dígitos)',
        minLength: 10,
        examples: {
          'Altice': '809-123-4567, 829-123-4567',
          'Viva': '809-234-5678, 849-234-5678',
          'Claro': '809-345-6789, 829-345-6789'
        }
      };
    }
    return null;
  };

  const countryInfo = getCountryInfo();
  if (!countryInfo) return null;

  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const isValidNumber = isValid();
  const detectedOperator = detectOperatorFromPhone(phoneNumber);
  const currentLength = cleanNumber.length;
  const requiredLength = countryInfo.minLength;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-gray-800">{countryInfo.title}</h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-3 bg-gray-100 rounded-lg border border-gray-200 shrink-0">
            <span className="text-base">{countryInfo.flag}</span>
            <span className="text-sm font-medium text-gray-600">{countryInfo.code}</span>
          </div>
          <input
            type="text"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder={countryInfo.placeholder}
            className={`flex-1 p-3 rounded-lg border-2 focus:outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 ${
              phoneNumber.length === 0
                ? 'border-gray-200 focus:border-blue-500 bg-white'
                : isValidNumber
                ? 'border-green-400 focus:border-green-500 bg-green-50'
                : 'border-red-400 focus:border-red-500 bg-red-50'
            }`}
          />
        </div>
        <p className="text-xs text-gray-500 pl-1">{countryInfo.description}</p>
      </div>

      {/* Status do número */}
      {phoneNumber.length > 0 && (
        <div>
          {currentLength < requiredLength && (
            <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <span className="font-medium">{requiredLength - currentLength} dígito(s) restante(s)</span>
            </div>
          )}

          {currentLength >= requiredLength && isValidNumber && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200 space-y-0.5">
              <div className="font-medium">Numero valido — {countryInfo.flag} {countryInfo.code} {formatPhoneNumber(phoneNumber)}</div>
              {detectedOperator && (
                <div className="text-green-600">Operadora: {getOperatorName(detectedOperator)}</div>
              )}
            </div>
          )}

          {currentLength >= requiredLength && !isValidNumber && (
            <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              Numero invalido. Use um prefixo valido para {destinationCountry === 'HT' ? 'Haiti' : 'Republica Dominicana'}.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

const getOperatorName = (operatorId: string): string => {
  const operatorNames: { [key: string]: string } = {
    'HT_D7_TopUp': 'Digicel Haiti BRL',
    'DBHT': 'Digicel Haiti (Prepaid Plans)',
    'HT_NM_TopUp': 'Natcom Haiti',
    'N2HT': 'Natcom Haiti Bundles',
    'ORDO': 'Altice (Orange) Rep. Dom.',
    'VVDO': 'Viva Rep. Dom.',
    'D8DO': 'Claro Data Rep. Dom.',
    'CLDO': 'Claro Rep. Dom.'
  };
  return operatorNames[operatorId] || 'Operadora desconhecida';
};