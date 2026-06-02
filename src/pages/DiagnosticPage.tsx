import { useState } from 'react';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface DiagnosticPageProps {
  onBack?: () => void;
}

export default function DiagnosticPage({ onBack }: DiagnosticPageProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [secretsTest, setSecretsTest] = useState<any>(null);

  const testAllSecrets = async () => {
    setLoading(true);
    setError(null);
    setSecretsTest(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-secrets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      setSecretsTest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao testar secrets');
    } finally {
      setLoading(false);
    }
  };

  const testSecrets = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dingconnect-operators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ diagnostic: true })
        }
      );

      const data = await response.json();

      if (response.ok && data.timestamp) {
        setResult(data);
      } else {
        setResult({
          timestamp: new Date().toISOString(),
          rawResponse: data,
          statusCode: response.status,
          message: 'Resposta inesperada da API',
          debugInfo: 'Verifique os detalhes abaixo',
          secretsConfigured: false
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao testar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          )}
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Diagnóstico de Configuração
          </h1>
          <p className="text-slate-600 mb-8">
            Verifica se os secrets do DingConnect estão configurados no Supabase
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={testSecrets}
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Testando...' : 'Testar DingConnect'}
            </button>
            <button
              onClick={testAllSecrets}
              disabled={loading}
              className="bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Testando...' : 'Ver Todos Secrets'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Erro</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`border rounded-xl p-6 ${
              result.secretsConfigured
                ? 'bg-green-50 border-green-200'
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                {result.secretsConfigured ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                )}
                <p className={`font-bold text-lg ${
                  result.secretsConfigured ? 'text-green-900' : 'text-orange-900'
                }`}>
                  {result.message}
                </p>
              </div>

              <div className="bg-white/50 rounded-lg p-4 font-mono text-sm">
                <div className="space-y-2">
                  {result.hasClientId !== undefined && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CLIENT_ID configurado:</span>
                        <span className={result.hasClientId && !result.clientIdIsEmpty ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {result.hasClientId && !result.clientIdIsEmpty ? 'Sim' : 'Nao'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">CLIENT_SECRET configurado:</span>
                        <span className={result.hasClientSecret && !result.clientSecretIsEmpty ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {result.hasClientSecret && !result.clientSecretIsEmpty ? 'Sim' : 'Nao'}
                        </span>
                      </div>
                    </>
                  )}
                  {result.rawResponse && (
                    <div className="mt-4 pt-4 border-t border-slate-300">
                      <p className="text-slate-600 mb-2 font-semibold">Raw Response:</p>
                      <pre className="text-xs overflow-auto max-h-64 bg-slate-100 p-2 rounded">
                        {JSON.stringify(result.rawResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Timestamp:</span>
                    <span className="text-slate-900 text-xs">{new Date(result.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {secretsTest && (
            <div className="border rounded-xl p-6 mt-6 bg-slate-50 border-slate-200">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Todos os Secrets</h3>
              <div className="bg-white rounded-lg p-4 font-mono text-xs">
                <pre className="overflow-auto">{JSON.stringify(secretsTest, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
