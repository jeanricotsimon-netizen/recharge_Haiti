import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { RechargePage } from './pages/RechargePage';
import { HistoryPage } from './pages/HistoryPage';
import { MessageCircle, QrCode, XCircle } from 'lucide-react';
import { pendingRechargeStorage, PendingRecharge } from './services/pendingRecharge';
import { supabaseService } from './services/supabase';

type Page = 'home' | 'recharge' | 'history';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [recoveredRecharge, setRecoveredRecharge] = useState<PendingRecharge | null>(null);
  // null = not checked yet, false = no pending, object = has pending to show
  const [pendingPrompt, setPendingPrompt] = useState<PendingRecharge | null>(null);
  const [showPendingPrompt, setShowPendingPrompt] = useState(false);

  useEffect(() => {
    const pending = pendingRechargeStorage.get();
    if (!pending) return;

    const ageMs = Date.now() - new Date(pending.createdAt).getTime();
    // Clear if older than 3 minutes — PIX expires quickly
    if (ageMs > 3 * 60 * 1000) {
      pendingRechargeStorage.clear();
      return;
    }

    supabaseService.getTransaction(pending.transactionId).then(async (txn) => {
      if (!txn) {
        pendingRechargeStorage.clear();
        return;
      }
      if (txn.status === 'success' || txn.status === 'refunded' || txn.status === 'failed') {
        pendingRechargeStorage.clear();
        return;
      }

      // Show a dismissable prompt instead of auto-navigating
      setPendingPrompt(pending);
      setShowPendingPrompt(true);
    });
  }, []);

  const dismissPending = () => {
    pendingRechargeStorage.clear();
    setPendingPrompt(null);
    setShowPendingPrompt(false);
  };

  const continuePending = async () => {
    if (!pendingPrompt) return;
    setShowPendingPrompt(false);

    // Try server-side recovery
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/recover-pending-recharge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: pendingPrompt.transactionId,
          paymentId: pendingPrompt.paymentId,
        }),
      });
      const result = await res.json();
      if (result.success || result.alreadyDone) {
        pendingRechargeStorage.clear();
        setPendingPrompt(null);
        return;
      }
    } catch {
      // silent
    }

    setRecoveredRecharge(pendingPrompt);
    setCurrentPage('recharge');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onStartRecharge={() => setCurrentPage('recharge')}
            onViewHistory={() => setCurrentPage('history')}
          />
        );
      case 'recharge':
        return (
          <RechargePage
            onBackToHome={() => {
              setRecoveredRecharge(null);
              setCurrentPage('home');
            }}
            recoveredRecharge={recoveredRecharge}
            onRecoveryConsumed={() => setRecoveredRecharge(null)}
          />
        );
      case 'history':
        return <HistoryPage onBack={() => setCurrentPage('home')} />;
      default:
        return (
          <HomePage
            onStartRecharge={() => setCurrentPage('recharge')}
            onViewHistory={() => setCurrentPage('history')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto">
        {renderPage()}
      </div>

      {/* Pending PIX modal — shown on top, user must choose */}
      {showPendingPrompt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px 20px 0 0',
            padding: '28px 20px 36px',
            width: '100%',
            maxWidth: '480px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <QrCode style={{ width: '28px', height: '28px', color: '#2563eb' }} />
              </div>
            </div>
            <h3 style={{ textAlign: 'center', fontWeight: '700', fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
              Pagamento PIX pendente
            </h3>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.5' }}>
              Voce tinha um PIX em andamento. Ja realizou o pagamento?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={continuePending}
                style={{
                  width: '100%', padding: '14px',
                  background: '#2563eb', color: 'white',
                  fontWeight: '600', fontSize: '15px',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                }}
              >
                Sim, verificar pagamento
              </button>
              <button
                onClick={dismissPending}
                style={{
                  width: '100%', padding: '14px',
                  background: '#f3f4f6', color: '#374151',
                  fontWeight: '600', fontSize: '15px',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <XCircle style={{ width: '18px', height: '18px' }} />
                Nao paguei, descartar
              </button>
            </div>
          </div>
        </div>
      )}

      <a
        href="https://wa.me/5551982615088"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        title="WhatsApp Suporte"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}

export default App;
