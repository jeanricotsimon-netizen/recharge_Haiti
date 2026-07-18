import React from 'react';

interface DestinationCountrySelectorProps {
  selectedDestination: string;
  onDestinationChange: (destination: string) => void;
}

export const DestinationCountrySelector: React.FC<DestinationCountrySelectorProps> = ({
  selectedDestination,
  onDestinationChange
}) => {
  const destinations = [
    {
      code: 'BR',
      name: 'Brasil',
      flag: '🇧🇷',
      operators: ['Claro', 'Tim', 'Vivo'],
      description: 'Recargas para operadoras brasileiras'
    },
    {
      code: 'HT',
      name: 'Haiti',
      flag: '🇭🇹',
      operators: ['Digicel', 'Natcom'],
      description: 'Recargas para operadoras haitianas'
    },
    {
      code: 'DO',
      name: 'República Dominicana',
      flag: '🇩🇴',
      operators: ['Altice/Orange', 'Viva', 'Claro Data'],
      description: 'Recargas para operadoras dominicanas'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">País de destino da recarga</h3>
      <p className="text-sm text-gray-600">
        Escolha para onde você quer enviar a recarga
      </p>
      
      <div className="space-y-3">
        {destinations.map((destination) => (
          <button
            key={destination.code}
            onClick={() => onDestinationChange(destination.code)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedDestination === destination.code
                ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{destination.flag}</span>
              <div className="flex-1 text-left">
                <div className="font-semibold text-lg mb-1">
                  {destination.name}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {destination.description}
                </div>
                <div className="flex flex-wrap gap-1">
                  {destination.operators.map((operator, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                      {operator}
                    </span>
                  ))}
                </div>
              </div>
              {selectedDestination === destination.code && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {selectedDestination && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">ℹ️</span>
            <span className="font-medium text-blue-800">País selecionado</span>
          </div>
          <p className="text-sm text-blue-700">
            Você escolheu enviar recarga para{' '}
            <strong>
              {destinations.find(d => d.code === selectedDestination)?.flag}{' '}
              {destinations.find(d => d.code === selectedDestination)?.name}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};