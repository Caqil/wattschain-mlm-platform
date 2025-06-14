
import { z } from 'zod';
import { ObjectId } from './index';

export const TransactionZodSchemas = {
  transactionFilter: z.object({
    type: z.enum(['token_purchase', 'commission_earning', 'commission_withdrawal', 'referral_bonus']).optional(),
    status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
    paymentMethod: z.enum(['mpesa', 'stripe', 'crypto', 'bank_transfer']).optional(),
    currency: z.enum(['KES', 'USD', 'BTC', 'ETH', 'USDT']).optional(),
    dateFrom: z.string().pipe(z.coerce.date()).optional(),
    dateTo: z.string().pipe(z.coerce.date()).optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional(),
    search: z.string().optional()
  }),

  transactionExport: z.object({
    format: z.enum(['csv', 'excel', 'pdf']).default('csv'),
    dateFrom: z.string().pipe(z.coerce.date()),
    dateTo: z.string().pipe(z.coerce.date()),
    includeDetails: z.boolean().default(true),
    filters: z.object({
      type: z.array(z.string()).optional(),
      status: z.array(z.string()).optional(),
      paymentMethod: z.array(z.string()).optional()
    }).optional()
  }),

  disputeTransaction: z.object({
    transactionId: z.string().min(1, 'Transaction ID required'),
    reason: z.enum(['unauthorized', 'duplicate', 'amount_incorrect', 'service_not_received', 'other']),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    evidence: z.array(z.instanceof(File)).optional()
  })
};

export interface TransactionSummary {
  totalVolume: number;
  totalCount: number;
  averageAmount: number;
  successRate: number;
  topPaymentMethod: string;
  topCurrency: string;
  growthRate: number;
  periodComparison: {
    volume: { current: number; previous: number; change: number };
    count: { current: number; previous: number; change: number };
  };
}

export interface PaymentMethodStats {
  method: string;
  volume: number;
  count: number;
  successRate: number;
  averageAmount: number;
  processingTime: number;
}

export interface TransactionTimeline {
  id: ObjectId;
  timestamp: Date;
  action: string;
  status: string;
  description: string;
  actor: 'system' | 'user' | 'admin';
  metadata?: any;
}
