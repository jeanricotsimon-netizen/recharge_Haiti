import { RechargeData } from '../types';

const STORAGE_KEY = 'pending_recharge';

export interface PendingRecharge {
  transactionId: string;
  paymentId: string;
  rechargeData: RechargeData;
  sessionId: string;
  totalAmount: number;
  dingconnectAmount: number;
  createdAt: string;
}

export const pendingRechargeStorage = {
  save(data: PendingRecharge): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage unavailable — silently ignore
    }
  },

  get(): PendingRecharge | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as PendingRecharge;
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
