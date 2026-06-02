import React, { useRef } from 'react';
import { TransactionHistory, TransactionHistoryHandle } from '../components/TransactionHistory';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface HistoryPageProps {
  onBack: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const historyRef = useRef<TransactionHistoryHandle>(null);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            Histórico
          </h2>
        </div>
        <button
          onClick={() => historyRef.current?.refresh()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all shadow-md text-sm font-semibold"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Transaction History */}
      <TransactionHistory ref={historyRef} />
    </div>
  );
};