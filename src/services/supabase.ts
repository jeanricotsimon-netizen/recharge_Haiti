import { createClient } from '@supabase/supabase-js';
import { Transaction } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isSupabaseConfigured = supabaseUrl && supabaseKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseKey !== 'your-supabase-anon-key' &&
  supabaseKey !== 'your_supabase_anon_key' &&
  supabaseKey.startsWith('eyJ');

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

const checkSupabaseConnection = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase nao esta configurado.');
  }
};

export const supabaseService = {
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    checkSupabaseConnection();

    if (transaction.paymentId) {
      const { data: existing } = await supabase!
        .from('transactions')
        .select('*')
        .eq('payment_id', transaction.paymentId)
        .limit(1);

      if (existing && existing.length > 0) {
        return this.mapDatabaseToTransaction(existing[0]);
      }
    }

    const sessionId = crypto.randomUUID();
    const transactionData = {
      user_id: null,
      session_id: sessionId,
      phone_number: transaction.phoneNumber,
      operator_id: transaction.operator,
      operator_name: transaction.operatorName || '',
      amount: transaction.amount,
      currency: transaction.currency,
      receive_value: transaction.receiveValue,
      receive_currency_iso: transaction.receiveCurrencyIso,
      country_from: transaction.countryFrom || 'BR',
      country_to: transaction.countryTo || 'HT',
      status: transaction.status,
      payment_method: transaction.paymentMethod,
      ding_transaction_id: transaction.dingconnectTransactionId,
      distributor_ref: transaction.distributorRef,
      payment_id: transaction.paymentId,
      refund_id: transaction.refundId,
      failure_reason: transaction.errorMessage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase!
      .from('transactions')
      .insert([transactionData])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] createTransaction error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }

    // Save session_id locally so history page can retrieve this transaction
    this.saveLocalSessionId(sessionId);

    return this.mapDatabaseToTransaction(data);
  },

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    checkSupabaseConnection();

    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.userId) dbUpdates.user_id = updates.userId;
    if (updates.phoneNumber) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.operator) dbUpdates.operator_id = updates.operator;
    if (updates.operatorName) dbUpdates.operator_name = updates.operatorName;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.currency) dbUpdates.currency = updates.currency;
    if (updates.receiveValue !== undefined) dbUpdates.receive_value = updates.receiveValue;
    if (updates.receiveCurrencyIso) dbUpdates.receive_currency_iso = updates.receiveCurrencyIso;
    if (updates.countryFrom) dbUpdates.country_from = updates.countryFrom;
    if (updates.countryTo) dbUpdates.country_to = updates.countryTo;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.paymentMethod) dbUpdates.payment_method = updates.paymentMethod;
    if (updates.dingconnectTransactionId) dbUpdates.ding_transaction_id = updates.dingconnectTransactionId;
    if (updates.distributorRef) dbUpdates.distributor_ref = updates.distributorRef;
    if (updates.paymentId) dbUpdates.payment_id = updates.paymentId;
    if (updates.refundId) dbUpdates.refund_id = updates.refundId;
    if (updates.errorMessage !== undefined) dbUpdates.failure_reason = updates.errorMessage;

    const { data, error } = await supabase!
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapDatabaseToTransaction(data);
  },

  async deleteTransaction(id: string): Promise<void> {
    checkSupabaseConnection();

    const { error } = await supabase!
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    checkSupabaseConnection();

    const { data, error } = await supabase!
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapDatabaseToTransaction);
  },

  async getRecentTransactions(limit: number = 50): Promise<Transaction[]> {
    checkSupabaseConnection();

    const { data, error } = await supabase!
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(this.mapDatabaseToTransaction);
  },

  getLocalSessionIds(): string[] {
    try {
      const raw = localStorage.getItem('ht_session_ids');
      if (!raw) return [];
      const ids = JSON.parse(raw);
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  },

  saveLocalSessionId(sessionId: string): void {
    try {
      const ids = this.getLocalSessionIds();
      if (!ids.includes(sessionId)) {
        ids.unshift(sessionId);
        // Keep only last 100 session IDs
        localStorage.setItem('ht_session_ids', JSON.stringify(ids.slice(0, 100)));
      }
    } catch {
      // ignore
    }
  },

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      checkSupabaseConnection();

      const { data, error } = await supabase!
        .from('transactions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return this.mapDatabaseToTransaction(data);
    } catch {
      return null;
    }
  },

  mapDatabaseToTransaction(dbData: any): Transaction {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      phoneNumber: dbData.phone_number,
      operator: dbData.operator_id,
      operatorName: dbData.operator_name,
      amount: dbData.amount,
      currency: dbData.currency,
      receiveValue: dbData.receive_value,
      receiveCurrencyIso: dbData.receive_currency_iso,
      countryFrom: dbData.country_from,
      countryTo: dbData.country_to,
      status: dbData.status,
      paymentMethod: dbData.payment_method,
      dingconnectTransactionId: dbData.ding_transaction_id,
      distributorRef: dbData.distributor_ref,
      paymentId: dbData.payment_id,
      refundId: dbData.refund_id,
      errorMessage: dbData.failure_reason,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    };
  },

  isConfigured(): boolean {
    return isSupabaseConfigured;
  }
};

export { isSupabaseConfigured };
