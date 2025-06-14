
import { Schema, model, models, Document } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  userId: string;
  transactionId: string;
  
  // Payment Details
  amount: number;
  currency: string;
  method: 'mpesa' | 'stripe' | 'crypto' | 'bank_transfer';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  
  // Payment Method Specific Data
  mpesa?: {
    phoneNumber: string;
    checkoutRequestId: string;
    mpesaReceiptNumber?: string;
    transactionDate?: Date;
  };
  
  stripe?: {
    paymentIntentId: string;
    clientSecret?: string;
    customerId?: string;
    paymentMethodId?: string;
  };
  
  crypto?: {
    address: string;
    network: string;
    txHash?: string;
    confirmations?: number;
    requiredConfirmations: number;
  };
  
  // Processing Details
  reference: string;
  externalReference?: string;
  processingFee: number;
  networkFee?: number;
  exchangeRate?: number;
  
  // Webhook Data
  webhookData?: any;
  callbackUrl?: string;
  
  // Timestamps
  initiatedAt: Date;
  confirmedAt?: Date;
  expiredAt?: Date;
  
  // Retry Logic
  retryCount: number;
  maxRetries: number;
  
  // Metadata
  metadata?: any;
  errorMessage?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    ref: 'Transaction',
    required: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['mpesa', 'stripe', 'crypto', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Payment Method Specific Data
  mpesa: {
    phoneNumber: String,
    checkoutRequestId: String,
    mpesaReceiptNumber: String,
    transactionDate: Date
  },
  
  stripe: {
    paymentIntentId: String,
    clientSecret: String,
    customerId: String,
    paymentMethodId: String
  },
  
  crypto: {
    address: String,
    network: String,
    txHash: String,
    confirmations: { type: Number, default: 0 },
    requiredConfirmations: { type: Number, default: 3 }
  },
  
  // Processing Details
  reference: {
    type: String,
    required: true,
    unique: true
  },
  externalReference: {
    type: String
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  networkFee: {
    type: Number,
    min: 0
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  
  // Webhook Data
  webhookData: {
    type: Schema.Types.Mixed
  },
  callbackUrl: {
    type: String
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: {
    type: Date
  },
  expiredAt: {
    type: Date
  },
  
  // Retry Logic
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
PaymentSchema.index({ userId: 1, status: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ method: 1, status: 1 });
PaymentSchema.index({ 'mpesa.checkoutRequestId': 1 });
PaymentSchema.index({ 'stripe.paymentIntentId': 1 });
PaymentSchema.index({ 'crypto.txHash': 1 });

export const Payment = models.Payment || model<IPayment>('Payment', PaymentSchema);
