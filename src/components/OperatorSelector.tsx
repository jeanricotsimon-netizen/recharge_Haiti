import React from 'react';
import { HAITI_OPERATORS, DOMINICAN_OPERATORS, BRAZIL_OPERATORS, ALL_OPERATORS } from '../constants/countries';
import { getOperatorInfo } from '../utils/operatorDetection';

interface OperatorSelectorProps {
  selectedOperator: string;
  onOperatorChange: (operator: string) => void;
  detectedOperator?: string | null;
  destinationCountry?: string;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  selectedOperator,
  onOperatorChange,
  detectedOperator,
  destinationCountry = 'HT'
}) => {
  // Get operators based on country
  const getOperatorsForCountry = (countryCode: string) => {
    switch (countryCode) {
      case 'HT':
        return HAITI_OPERATORS;
      case 'DO':
        return DOMINICAN_OPERATORS;
      case 'BR':
        return BRAZIL_OPERATORS;
      default:
        return HAITI_OPERATORS;
    }
  };

  const operators = getOperatorsForCountry(destinationCountry);

  const getOperatorIcon = (operatorId: string) => {
    // Haiti operators
    if (operatorId === 'HT_D7_TopUp' || operatorId === 'DBHT') return '📱'; // Digicel
    if (operatorId === 'HT_NM_TopUp' || operatorId === 'N2HT') return '📞'; // Natcom

    // Dominican Republic operators
    if (operatorId === 'ORDO') return '🟠'; // Orange/Altice
    if (operatorId === 'VVDO') return '🟢'; // Viva
    if (operatorId === 'D8DO' || operatorId === 'CLDO') return '🔴'; // Claro

    // Brazil operators
    if (operatorId === 'BR_CL_TopUp') return '🔴'; // Claro
    if (operatorId === 'BR_IM_TopUp') return '🔵'; // Tim
    if (operatorId === 'BR_VO_TopUp') return '🟣'; // Vivo

    return '📱'; // Default
  };

  const getOperatorLimits = (operatorId: string) => {
    const operator = ALL_OPERATORS.find(op => op.id === operatorId);
    if (!operator) return '';
    
    return `R$ ${operator.minAmountBRL?.toFixed(0)} - R$ ${operator.maxAmountBRL?.toFixed(0)}`;
  };

  const getOperatorDescription = (operatorId: string) => {
    // Haiti operators
    if (operatorId === 'HT_D7_TopUp') return 'Digicel Haiti BRL - Recargas em Real';
    if (operatorId === 'DBHT') return 'Digicel Haiti - Planos Pré-pagos';
    if (operatorId === 'HT_NM_TopUp') return 'Natcom Haiti - Operadora nacional';
    if (operatorId === 'N2HT') return 'Natcom Haiti - Pacotes de dados';

    // Dominican Republic operators
    if (operatorId === 'ORDO') return 'Orange/Altice República Dominicana';
    if (operatorId === 'VVDO') return 'Viva República Dominicana';
    if (operatorId === 'D8DO') return 'Claro Data República Dominicana';
    if (operatorId === 'CLDO') return 'Claro República Dominicana';

    // Brazil operators
    if (operatorId === 'BR_CL_TopUp') return 'Claro Brasil - Recarga pré-paga';
    if (operatorId === 'BR_IM_TopUp') return 'Tim Brasil - Recarga pré-paga';
    if (operatorId === 'BR_VO_TopUp') return 'Vivo Brasil - Recarga pré-paga';

    return '';
  };

  const isDetected = (operatorId: string) => {
    return detectedOperator === operatorId;
  };

  const getCountryName = () => {
    if (destinationCountry === 'HT') return 'Haiti';
    if (destinationCountry === 'DO') return 'República Dominicana';
    if (destinationCountry === 'BR') return 'Brasil';
    return 'Haiti';
  };

  const getCountryFlag = () => {
    if (destinationCountry === 'HT') return '🇭🇹';
    if (destinationCountry === 'DO') return '🇩🇴';
    if (destinationCountry === 'BR') return '🇧🇷';
    return '🇭🇹';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {getCountryFlag()} Escolha a operadora
        </h3>
        {detectedOperator && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            ✅ Auto-detectada
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Operadoras disponíveis no {getCountryName()}:
      </div>
      
      <div className="space-y-3">
        {operators.map((operator) => (
          <button
            key={operator.id}
            onClick={() => onOperatorChange(operator.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 relative ${
              selectedOperator === operator.id
                ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                : isDetected(operator.id)
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            {/* Detection indicator */}
            {isDetected(operator.id) && (
              <div className="absolute top-3 right-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
            
            {/* Selection indicator */}
            {selectedOperator === operator.id && (
              <div className="absolute top-3 right-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            )}
            
            <div className="flex items-start space-x-4">
              {/* Operator icon */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <span className="text-2xl">{getOperatorIcon(operator.id)}</span>
              </div>
              
              {/* Operator info */}
              <div className="flex-1 text-left">
                <div className="font-semibold text-base mb-1">
                  {operator.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {getOperatorDescription(operator.id)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Limites: {getOperatorLimits(operator.id)}
                  </div>
                  {isDetected(operator.id) && (
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Detectada
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Detection info */}
      {detectedOperator && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Operadora detectada automaticamente
              </p>
              <p className="text-xs text-blue-700">
                Baseado no prefixo do número de telefone. Você pode escolher uma operadora diferente se necessário.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Country info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-600">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium">País de destino:</span>
            <span>{getCountryFlag()} {getCountryName()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Operadoras disponíveis:</span>
            <span>{operators.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};