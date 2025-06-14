import { Schema, model, models, Document } from 'mongoose';

export interface ICommission extends Document {
  _id: string;
  userId: string; // Who earns the commission
  fromUserId: string; // Who generated the purchase
  transactionId: string; // Related purchase transaction
  
  // Commission Details
  amount: number;
  percentage: number; // Commission percentage (10%, 5%, 3%, 2%, 1%)
  level: number; // MLM level (1-5)
  sourceAmount: number; // Original purchase amount
  
  // Lock Period (12 months)
  isLocked: boolean;
  lockedUntil: Date; // 12 months from earning date
  lockPeriodMonths: number; // Always 12 for compliance
  
  // Status
  status: 'pending' | 'earned' | 'locked' | 'unlocked' | 'withdrawn' | 'cancelled';
  earnedAt: Date;
  unlockedAt?: Date;
  withdrawnAt?: Date;
  
  // Withdrawal Details
  withdrawalTransactionId?: string;
  withdrawalMethod?: string;
  withdrawalReference?: string;
  
  // Metadata
  metadata?: any;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>({
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  fromUserId: {
    type: String,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    ref: 'Transaction',
    required: true
  },
  
  // Commission Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  sourceAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Lock Period
  isLocked: {
    type: Boolean,
    default: true
  },
  lockedUntil: {
    type: Date,
    required: true
  },
  lockPeriodMonths: {
    type: Number,
    default: 12,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'earned', 'locked', 'unlocked', 'withdrawn', 'cancelled'],
    default: 'pending'
  },
  earnedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  unlockedAt: {
    type: Date
  },
  withdrawnAt: {
    type: Date
  },
  
  // Withdrawal Details
  withdrawalTransactionId: {
    type: String,
    ref: 'Transaction'
  },
  withdrawalMethod: {
    type: String
  },
  withdrawalReference: {
    type: String
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
CommissionSchema.index({ userId: 1, status: 1 });
CommissionSchema.index({ fromUserId: 1 });
CommissionSchema.index({ transactionId: 1 });
CommissionSchema.index({ isLocked: 1, lockedUntil: 1 });
CommissionSchema.index({ earnedAt: 1 });
CommissionSchema.index({ level: 1 });

// Pre-save middleware to set lockedUntil date
CommissionSchema.pre('save', function(next) {
  if (this.isNew) {
    const lockDate = new Date(this.earnedAt);
    lockDate.setMonth(lockDate.getMonth() + this.lockPeriodMonths);
    this.lockedUntil = lockDate;
    this.status = 'locked';
  }
  next();
});

export const Commission = models.Commission || model<ICommission>('Commission', CommissionSchema);
