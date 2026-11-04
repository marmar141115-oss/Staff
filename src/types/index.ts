export type OperatorType = 'orange' | 'mtn' | 'blue' | 'express_union' | 'other';

export type TransactionType = 
  | 'transfer_send'
  | 'transfer_receive'
  | 'withdrawal'
  | 'deposit'
  | 'merchant_payment'
  | 'bill_payment'
  | 'airtime_bundle';

export interface Wallet {
  id: string;
  name: string;
  operator: OperatorType;
  phoneNumber: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  color: string;
  accentColor: string;
  tier: string;
  dailyLimit: number;
  spentToday: number;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  title: string;
  recipientOrMerchant: string;
  recipientPhone?: string;
  amount: number;
  fee: number;
  currency: string;
  operator: OperatorType;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  category: string;
  balanceAfter: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  operator: OperatorType;
  avatar?: string;
  isFavorite?: boolean;
  city?: string;
}

export interface Merchant {
  id: string;
  code: string;
  name: string;
  category: string;
  city: string;
  logo: string;
  acceptsOperator: OperatorType[];
}

export interface BillProvider {
  id: string;
  name: string;
  category: 'electricity' | 'water' | 'tv' | 'internet' | 'taxes';
  logo: string;
  codePrefix: string;
  fields: {
    label: string;
    placeholder: string;
    type: string;
  }[];
}

export interface InternetBundle {
  id: string;
  operator: OperatorType;
  name: string;
  volume: string;
  validity: string;
  price: number;
  popular?: boolean;
  category: 'data' | 'voice' | 'combo' | 'night';
}

export interface SecurityConfig {
  biometricsEnabled: boolean;
  biometricType: 'fingerprint' | 'face' | 'both';
  pinCode: string; // 4 digits
  requirePinForBalance: boolean;
  requirePinForPayment: boolean;
  antiShoulderSurfing: boolean; // scramble keypad
  autoLockMinutes: number;
  dailyTransferLimit: number;
  isAccountFrozen: boolean;
  lastLoginDevice: string;
  lastLoginLocation: string;
}
