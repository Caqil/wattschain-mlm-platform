
import { Schema, model, models, Document } from 'mongoose';

export interface IPresaleRound extends Document {
  _id: string;
  round: number;
  name: string;
  
  // Pricing
  price: number; // Price per token
  minPurchase: number; // Minimum purchase amount
  maxPurchase?: number; // Maximum purchase amount
  
  // Supply
  totalTokens: number; // Total tokens available for this round
  soldTokens: number; // Tokens sold in this round
  remainingTokens: number; // Tokens remaining
  
  // Timing
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  
  // Bonus Structure
  bonusPercentage?: number; // Early bird bonus
  bonusConditions?: string; // Conditions for bonus
  
  // Purchase Statistics
  totalPurchases: number; // Number of purchases
  totalAmount: number; // Total amount raised
  uniqueBuyers: number; // Number of unique buyers
  
  // Restrictions
  isKYCRequired: boolean;
  allowedCountries?: string[]; // Allowed countries
  blockedCountries?: string[]; // Blocked countries
  
  // Metadata
  description?: string;
  features?: string[]; // Special features of this round
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const PresaleRoundSchema = new Schema<IPresaleRound>({
  round: {
    type: Number,
    required: true,
    unique: true,
    min: 1
  },
  name: {
    type: String,
    required: true
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    required: true,
    default: 100000, // 100,000 KES minimum
    min: 0
  },
  maxPurchase: {
    type: Number,
    min: 0
  },
  
  // Supply
  totalTokens: {
    type: Number,
    required: true,
    min: 0
  },
  soldTokens: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingTokens: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Timing
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  
  // Bonus Structure
  bonusPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  bonusConditions: {
    type: String
  },
  
  // Purchase Statistics
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  uniqueBuyers: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Restrictions
  isKYCRequired: {
    type: Boolean,
    default: true
  },
  allowedCountries: [{
    type: String
  }],
  blockedCountries: [{
    type: String
  }],
  
  // Metadata
  description: {
    type: String
  },
  features: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
PresaleRoundSchema.index({ round: 1 });
PresaleRoundSchema.index({ isActive: 1 });
PresaleRoundSchema.index({ startDate: 1, endDate: 1 });

// Virtual for sold percentage
PresaleRoundSchema.virtual('soldPercentage').get(function() {
  return this.totalTokens > 0 ? (this.soldTokens / this.totalTokens) * 100 : 0;
});

// Pre-save middleware to calculate remaining tokens
PresaleRoundSchema.pre('save', function(next) {
  this.remainingTokens = this.totalTokens - this.soldTokens;
  next();
});

// Validation for date ranges
PresaleRoundSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

export const PresaleRound = models.PresaleRound || model<IPresaleRound>('PresaleRound', PresaleRoundSchema);