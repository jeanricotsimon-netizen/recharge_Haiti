import React from 'react';
import { Smartphone, History, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface HomePageProps {
  onStartRecharge: () => void;
  onViewHistory: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartRecharge, onViewHistory }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl rotate-6 opacity-30" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t.home.title}</h1>
          <p className="text-gray-500 mt-1 text-base">{t.home.subtitle}</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          onClick={onStartRecharge}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <div className="flex items-center justify-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span className="font-semibold text-base">{t.home.startRecharge}</span>
          </div>
        </button>

        <button
          onClick={onViewHistory}
          className="w-full bg-white text-gray-700 py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-center space-x-2">
            <History className="h-5 w-5 text-gray-500" />
            <span className="font-semibold text-base">{t.home.viewHistory}</span>
          </div>
        </button>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
          <Zap className="h-5 w-5 text-blue-500 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-blue-700">PIX</p>
          <p className="text-xs text-blue-500 mt-0.5">Instantâneo</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
          <ShieldCheck className="h-5 w-5 text-green-500 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-green-700">Seguro</p>
          <p className="text-xs text-green-500 mt-0.5">100% confiável</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
          <RefreshCw className="h-5 w-5 text-orange-500 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-orange-700">Reembolso</p>
          <p className="text-xs text-orange-500 mt-0.5">Automático</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">{t.home.supportedOperators}</h3>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-base">🇭🇹</span>
              <p className="text-sm text-gray-600">{t.home.haitiOperators}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base">🇩🇴</span>
              <p className="text-sm text-gray-600">{t.home.drOperators}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <h3 className="font-semibold text-green-800 text-sm mb-1">{t.home.autoRefund}</h3>
          <p className="text-sm text-green-700">{t.home.autoRefundDesc}</p>
        </div>
      </div>
    </div>
  );
};
