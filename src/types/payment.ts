
import { z } from 'zod';

export const PaymentZodSchemas = {
  tokenPurchase: z.object({
    amount: z.number().min(100, 'Minimum purchase is 100 KES'),
    currency: z.enum(['KES', 'USD', 'BTC', 'ETH', 'USDT']).default('KES'),
    paymentMethod: z.enum(['mpesa', 'stripe', 'crypto', 'bank_transfer']),
    referralCode: z.string().optional()
  }),

  mpesaPayment: z.object({
    phoneNumber: z.string().regex(/^\+?254[0-9]{9}$/, 'Invalid M-Pesa number'),
    amount: z.number().min(1),
    accountReference: z.string().optional(),
    transactionDesc: z.string().optional()
  }),

  stripePayment: z.object({
    paymentMethodId: z.string().min(1, 'Payment method required'),
    amount: z.number().min(1),
    currency: z.enum(['usd', 'eur', 'gbp']).default('usd'),
    savePaymentMethod: z.boolean().default(false)
  }),

  cryptoPayment: z.object({
    amount: z.number().min(1),
    cryptocurrency: z.enum(['BTC', 'ETH', 'USDT']),
    network: z.enum(['bitcoin', 'ethereum', 'binancesmartchain']).optional(),
    userAddress: z.string().min(1, 'Sender address required')
  }),

  bankTransfer: z.object({
    amount: z.number().min(1000, 'Minimum bank transfer is 1,000 KES'),
    bankName: z.string().min(1, 'Bank name required'),
    accountNumber: z.string().min(1, 'Account number required'),
    referenceNumber: z.string().min(1, 'Reference number required'),
    transferDate: z.string().pipe(z.coerce.date())
  }),

  refundRequest: z.object({
    transactionId: z.string().min(1, 'Transaction ID required'),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    refundMethod: z.enum(['original', 'bank_transfer', 'mpesa']).default('original'),
    bankDetails: z.object({
      bankName: z.string(),
      accountNumber: z.string(),
      accountName: z.string()
    }).optional()
  })
};

export interface PaymentMethodConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  supportedCurrencies: string[];
  processingFee: number;
  processingTime: string;
  minimumAmount: number;
  maximumAmount: number;
}

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: Date;
  source: string;
}

export interface CryptoPaymentAddress {
  currency: string;
  network: string;
  address: string;
  qrCode: string;
  minimumConfirmations: number;
  currentConfirmations?: number;
}