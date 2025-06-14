import { Schema, model, models, Document } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  userId: string;
  type: 'token_purchase' | 'commission_earning' | 'commission_withdrawal' | 'referral_bonus';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // Transaction Details
  amount: number;
  currency: 'KES' | 'USD' | 'BTC' | 'ETH' | 'USDT';
  tokenAmount?: number;
  tokenPrice?: number;
  presaleRound?: number;
  
  // Payment Details
  paymentMethod: 'mpesa' | 'stripe' | 'crypto' | 'bank_transfer';
  paymentReference: string;
  paymentDetails?: any;
  
  // MLM Related
  fromUserId?: string; // For commission earnings
  mlmLevel?: number; // 1-5 for MLM levels
  relatedTransactionId?: string;
  
  // Processing
  processingFee?: number;
  netAmount: number;
  description: string;
  
  // Metadata
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamps
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['token_purchase', 'commission_earning', 'commission_withdrawal', 'referral_bonus'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Transaction Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['KES', 'USD', 'BTC', 'ETH', 'USDT'],
    required: true
  },
  tokenAmount: {
    type: Number,
    min: 0
  },
  tokenPrice: {
    type: Number,
    min: 0
  },
  presaleRound: {
    type: Number,
    min: 1
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'stripe', 'crypto', 'bank_transfer'],
    required: true
  },
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  paymentDetails: {
    type: Schema.Types.Mixed
  },
  
  // MLM Related
  fromUserId: {
    type: String,
    ref: 'User'
  },
  mlmLevel: {
    type: Number,
    min: 1,
    max: 5
  },
  relatedTransactionId: {
    type: String,
    ref: 'Transaction'
  },
  
  // Processing
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ paymentReference: 1 });
TransactionSchema.index({ fromUserId: 1 });

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);
