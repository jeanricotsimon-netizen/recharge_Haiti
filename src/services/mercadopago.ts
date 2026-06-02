import { PaymentResponse } from '../types';

class MercadoPagoService {
  isTestMode(): boolean {
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '';
    return publicKey.startsWith('TEST-');
  }

  isProperlyConfigured(): boolean {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return supabaseUrl.includes('.supabase.co') && supabaseKey.startsWith('eyJ');
  }

  async createPixPayment(
    amount: number,
    email: string,
    phoneNumber: string,
    description: string
  ): Promise<PaymentResponse & { qrCode?: string; qrCodeBase64?: string }> {
    try {
      if (!this.isProperlyConfigured()) {
        return {
          success: false,
          error: 'SUPABASE_NOT_CONFIGURED',
          status: 'failed',
          message: 'Sistema nao configurado. Tente novamente mais tarde.'
        };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-payment`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, email, phoneNumber, description })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[MercadoPago] error response:', response.status, responseData);
        return {
          success: false,
          error: responseData.error || 'PAYMENT_FAILED',
          status: 'failed',
          message: responseData.message || `Erro ao criar pagamento PIX (HTTP ${response.status})`
        };
      }

      const testMode = this.isTestMode();
      return {
        ...responseData,
        productionMode: !testMode,
        testMode
      };
    } catch (err) {
      console.error('[MercadoPago] fetch exception:', err);
      return {
        success: false,
        error: 'API_ERROR',
        status: 'failed',
        message: err instanceof Error ? err.message : 'Erro de conexao. Verifique sua internet.'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      if (!this.isProperlyConfigured()) {
        return { success: false, error: 'NOT_CONFIGURED', status: 'failed' };
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-status`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId })
      });

      if (!response.ok) {
        return { success: false, error: 'STATUS_CHECK_FAILED', status: 'failed' };
      }

      const responseData = await response.json();
      const testMode = this.isTestMode();
      return {
        success: true,
        paymentId,
        status: responseData.status,
        productionMode: !testMode,
        testMode
      };
    } catch {
      return { success: false, error: 'STATUS_CHECK_FAILED', status: 'failed' };
    }
  }

  getCurrentConfiguration() {
    const testMode = this.isTestMode();
    return {
      mode: testMode ? 'test' : 'production',
      isConfigured: this.isProperlyConfigured(),
      isLive: !testMode,
      isTest: testMode
    };
  }
}

export const mercadopagoService = new MercadoPagoService();
