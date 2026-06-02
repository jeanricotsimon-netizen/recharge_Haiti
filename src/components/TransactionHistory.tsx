import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Transaction } from '../types';
import { supabaseService } from '../services/supabase';
import { CheckCircle, XCircle, Clock, RefreshCw, MessageCircle, Trash2, Lock, Eye, EyeOff } from 'lucide-react';

export interface TransactionHistoryHandle {
  refresh: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getCountryDialCode = (operatorId: string): string => {
  if (operatorId.includes('DO') || operatorId.startsWith('OR') ||
      operatorId.startsWith('VV') || operatorId.startsWith('D8') ||
      operatorId.startsWith('CL')) {
    return '+1';
  }
  return '+509';
};

export const TransactionHistory = forwardRef<TransactionHistoryHandle>((_, ref) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadTransactions(); }, []);

  useEffect(() => {
    if (pendingDeleteId && pinInputRef.current) {
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [pendingDeleteId]);

  const loadTransactions = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await supabaseService.getRecentTransactions(50);
      setTransactions(data);
    } catch (error: any) {
      setLoadError(error?.message || 'Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ refresh: loadTransactions }));

  const openDeleteModal = (id: string) => {
    setPendingDeleteId(id);
    setPin('');
    setPinError('');
    setShowPin(false);
  };

  const closeDeleteModal = () => {
    setPendingDeleteId(null);
    setPin('');
    setPinError('');
    setShowPin(false);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    if (!pin) { setPinError('Digite o PIN'); return; }

    setDeleting(true);
    setPinError('');

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-delete-transaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId: pendingDeleteId, pin }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setPinError(data.error || 'Erro ao excluir');
        return;
      }

      setTransactions(prev => prev.filter(t => t.id !== pendingDeleteId));
      closeDeleteModal();
    } catch {
      setPinError('Erro de conexão. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'refunded': return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Concluída';
      case 'failed': return 'Falhou';
      case 'refunded': return 'Reembolsada';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Histórico de Recargas</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Histórico de Recargas</h3>
        <div className="text-center py-8 bg-red-50 rounded-lg p-4">
          <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 font-medium">Erro ao carregar</p>
          <p className="text-red-500 text-sm mt-1">{loadError}</p>
          <button onClick={loadTransactions} className="mt-3 text-sm text-blue-600 underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PIN Modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeleteModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Lock className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Confirmar exclusão</h2>
              <p className="text-sm text-gray-500 text-center">
                Digite o PIN de administrador para excluir este registro permanentemente.
              </p>
            </div>

            <div className="relative">
              <input
                ref={pinInputRef}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleConfirmDelete()}
                placeholder="PIN"
                className={`w-full border rounded-xl px-4 py-3 pr-12 text-center text-2xl tracking-widest font-bold outline-none transition-all
                  ${pinError ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-300 focus:border-blue-500 text-gray-900'}`}
              />
              <button
                type="button"
                onClick={() => setShowPin(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {pinError && (
              <p className="text-sm text-red-600 text-center -mt-3">{pinError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting || !pin}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Trash2 className="h-4 w-4" />
                }
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Histórico de Recargas</h3>
          <span className="text-sm text-gray-500">{transactions.length} registro(s)</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma recarga encontrada</p>
            <p className="text-gray-400 text-sm mt-1">As recargas aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{getStatusIcon(transaction.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {getCountryDialCode(transaction.operator)} {transaction.phoneNumber}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {transaction.operator} • {transaction.currency} {transaction.amount}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                    </div>
                    {transaction.dingconnectTransactionId && (
                      <div className="text-xs text-gray-400 truncate">
                        Ding: {transaction.dingconnectTransactionId}
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </span>
                </div>

                {transaction.errorMessage && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {transaction.errorMessage}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openDeleteModal(transaction.id)}
                    className="flex items-center justify-center gap-2 w-full text-sm font-medium text-red-500 py-2 px-3 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir registro
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <a
            href="https://wa.me/5551982615088"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg border border-green-300 hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
          >
            <div className="flex items-center justify-center space-x-3">
              <MessageCircle className="h-5 w-5 text-white" />
              <div className="text-center">
                <h3 className="font-semibold text-white">Dúvidas sobre suas transações?</h3>
                <p className="text-xs text-green-50">Fale conosco: +55 51 98261-5088</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>
  );
});
