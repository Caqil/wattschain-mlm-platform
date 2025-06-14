
import { ObjectId, CurrencyType, StatusType } from './index';

// Transaction Types
export type TransactionType = 'token_purchase' | 'commission_earning' | 'commission_withdrawal' | 'referral_bonus';

export interface Transaction {
  id: ObjectId;
  userId: ObjectId;
  type: TransactionType;
  status: StatusType;
  
  // Transaction Details
  amount: number;
  currency: CurrencyType;
  tokenAmount?: number;
  tokenPrice?: number;
  presaleRound?: number;
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentReference: string;
  
  // MLM Related
  fromUserId?: ObjectId;
  mlmLevel?: number;
  relatedTransactionId?: ObjectId;
  
  // Processing
  processingFee: number;
  netAmount: number;
  description: string;
  
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
}

export interface TransactionSummary {
  totalAmount: number;
  totalCount: number;
  byType: Record<TransactionType, { amount: number; count: number }>;
  byStatus: Record<StatusType, { amount: number; count: number }>;
  byPaymentMethod: Record<PaymentMethod, { amount: number; count: number }>;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  paymentMethod: PaymentMethod;
  tokenAmount?: number;
  presaleRound?: number;
  description: string;
  metadata?: Record<string, any>;
}

export interface TransactionFilter {
  userId?: ObjectId;
  type?: TransactionType;
  status?: StatusType;
  paymentMethod?: PaymentMethod;
  currency?: CurrencyType;
  amountRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface TransactionListItem {
  id: ObjectId;
  type: TransactionType;
  status: StatusType;
  amount: number;
  currency: CurrencyType;
  paymentMethod: PaymentMethod;
  description: string;
  createdAt: Date;
  processedAt?: Date;
}

export type PaymentMethod = 'mpesa' | 'stripe' | 'crypto' | 'bank_transfer';
