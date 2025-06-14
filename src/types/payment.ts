import { ObjectId } from "mongoose";
import { CurrencyType } from ".";


// Payment Types
export type PaymentMethodType = 'mpesa' | 'stripe' | 'crypto' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface Payment {
  id: ObjectId;
  userId: ObjectId;
  transactionId: ObjectId;
  
  // Payment Details
  amount: number;
  currency: CurrencyType;
  method: PaymentMethodType;
  status: PaymentStatus;
  
  // Payment Method Specific Data
  mpesa?: MPesaPaymentData;
  stripe?: StripePaymentData;
  crypto?: CryptoPaymentData;
  
  // Processing Details
  reference: string;
  externalReference?: string;
  processingFee: number;
  networkFee?: number;
  exchangeRate?: number;
  
  // Timestamps
  initiatedAt: Date;
  confirmedAt?: Date;
  expiredAt?: Date;
  
  // Retry Logic
  retryCount: number;
  maxRetries: number;
  
  // Metadata
  errorMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// MPesa Payment Types
export interface MPesaPaymentData {
  phoneNumber: string;
  checkoutRequestId: string;
  mpesaReceiptNumber?: string;
  transactionDate?: Date;
}

export interface MPesaInitiateRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface MPesaCallbackResponse {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: any;
        }>;
      };
    };
  };
}

// Stripe Payment Types
export interface StripePaymentData {
  paymentIntentId: string;
  clientSecret?: string;
  customerId?: string;
  paymentMethodId?: string;
}

export interface StripeCreatePaymentIntentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Crypto Payment Types
export interface CryptoPaymentData {
  address: string;
  network: string;
  txHash?: string;
  confirmations: number;
  requiredConfirmations: number;
}

export interface CryptoAddressRequest {
  currency: 'BTC' | 'ETH' | 'USDT';
  network?: string;
}

export interface CryptoAddressResponse {
  address: string;
  currency: string;
  network: string;
  qrCode: string;
  expiresAt: Date;
}

export interface CryptoTransactionVerification {
  txHash: string;
  currency: string;
  network: string;
  amount: number;
  confirmations: number;
  isConfirmed: boolean;
}

// Payment Processing Types
export interface ProcessPaymentRequest {
  userId: ObjectId;
  amount: number;
  currency: CurrencyType;
  method: PaymentMethodType;
  transactionId: ObjectId;
  paymentDetails: MPesaInitiateRequest | StripeCreatePaymentIntentRequest | CryptoAddressRequest;
}

export interface PaymentGatewayConfig {
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    businessShortCode: string;
    passkey: string;
    callbackUrl: string;
    environment: 'sandbox' | 'production';
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    environment: 'test' | 'live';
  };
  crypto: {
    networks: {
      bitcoin: { address: string; apiKey: string };
      ethereum: { address: string; apiKey: string };
      tether: { address: string; apiKey: string };
    };
  };
}

export interface PaymentSummary {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  byMethod: Record<PaymentMethodType, {
    amount: number;
    count: number;
    successRate: number;
  }>;
  byStatus: Record<PaymentStatus, {
    amount: number;
    count: number;
  }>;
}
