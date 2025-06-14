
import { Schema, model, models, Document } from 'mongoose';

export interface IWallet extends Document {
  _id: string;
  userId: string;
  
  // Balances
  tokenBalance: number; // WattsChain tokens
  availableBalance: number; // Available for withdrawal
  lockedBalance: number; // Locked commissions
  
  // Commission Wallet
  totalCommissionsEarned: number;
  totalCommissionsWithdrawn: number;
  pendingCommissions: number;
  
  // Transaction Counters
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  
  // Wallet Addresses (for crypto payments)
  addresses: {
    btc?: string;
    eth?: string;
    usdt?: string;
  };
  
  // Security
  pin?: string; // Encrypted wallet PIN
  isLocked: boolean;
  lastActivity: Date;
  
  // Metadata
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Balances
  tokenBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  lockedBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Commission Wallet
  totalCommissionsEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCommissionsWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingCommissions: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Transaction Counters
  totalDeposits: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0,
    min: 0
  },
  transactionCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Wallet Addresses
  addresses: {
    btc: String,
    eth: String,
    usdt: String
  },
  
  // Security
  pin: {
    type: String
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
WalletSchema.index({ userId: 1 });
WalletSchema.index({ isLocked: 1 });

// Virtual for total balance
WalletSchema.virtual('totalBalance').get(function() {
  return this.availableBalance + this.lockedBalance;
});

export const Wallet = models.Wallet || model<IWallet>('Wallet', WalletSchema);
