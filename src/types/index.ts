export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  paymentMethods: string[];
}

export interface Operator {
  id: string;
  name: string;
  logoUrl: string;
  country: string;
  fxRate?: number;
  currencyCode?: string;
  denominations: number[];
  prefixes?: string[];
  minAmountBRL?: number;
  maxAmountBRL?: number;
  commission?: number;
  receiveValueDivisor?: number;
}

export interface RechargeData {
  originCountry: string;
  phoneNumber: string;
  operator: string;
  amount: number;
  paymentMethod: string;
}

export interface Transaction {
  id: string;
  userId: string;
  phoneNumber: string;
  operator: string;
  operatorName?: string;
  amount: number;
  currency: string;
  receiveValue?: number;
  receiveCurrencyIso?: string;
  countryFrom?: string;
  countryTo?: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  paymentMethod: string;
  dingconnectTransactionId?: string;
  distributorRef?: string;
  paymentId?: string;
  refundId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DingConnectResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
  message?: string;
}
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  refundId?: string;
  error?: string;
  status?: string;
  message?: string;
  amount?: number;
  productionMode?: boolean;
  [key: string]: unknown;
}