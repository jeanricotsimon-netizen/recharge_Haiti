class DingConnectService {
  isProperlyConfigured(): boolean {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    return supabaseUrl.includes('.supabase.co') && supabaseKey.startsWith('eyJ');
  }

  getConnectionStatus(): { status: string; isConnected: boolean } {
    return {
      status: this.isProperlyConfigured() ? 'configured' : 'not_configured',
      isConnected: this.isProperlyConfigured()
    };
  }

  getCurrentConfiguration() {
    return {
      mode: 'production',
      isConfigured: this.isProperlyConfigured(),
      productionMode: true
    };
  }
}

export const dingconnectService = new DingConnectService();
