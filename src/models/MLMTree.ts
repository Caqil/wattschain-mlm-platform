import { Schema, model, models, Document } from 'mongoose';

export interface IMLMTree extends Document {
  _id: string;
  userId: string;
  referrerId?: string;
  level: number;
  position: number;
  
  // Tree Structure
  leftChild?: string;
  rightChild?: string;
  uplineMembers: string[]; // Array of upline user IDs (5 levels max)
  downlineMembers: string[]; // Direct downline members
  
  // MLM Statistics
  totalDownlineCount: number;
  directReferrals: number;
  totalVolume: number; // Total purchase volume of downline
  personalVolume: number; // User's own purchase volume
  
  // Level Counts (for commission calculation)
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  level5Count: number;
  
  // Activation Status
  isActive: boolean;
  activatedAt?: Date;
  
  // Anti-Fraud Flags
  isSuspicious: boolean;
  fraudFlags: string[];
  lastAuditDate?: Date;
  
  // Metadata
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const MLMTreeSchema = new Schema<IMLMTree>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  referrerId: {
    type: String,
    ref: 'User'
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  position: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Tree Structure
  leftChild: {
    type: String,
    ref: 'User'
  },
  rightChild: {
    type: String,
    ref: 'User'
  },
  uplineMembers: [{
    type: String,
    ref: 'User'
  }],
  downlineMembers: [{
    type: String,
    ref: 'User'
  }],
  
  // MLM Statistics
  totalDownlineCount: {
    type: Number,
    default: 0,
    min: 0
  },
  directReferrals: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVolume: {
    type: Number,
    default: 0,
    min: 0
  },
  personalVolume: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Level Counts
  level1Count: { type: Number, default: 0, min: 0 },
  level2Count: { type: Number, default: 0, min: 0 },
  level3Count: { type: Number, default: 0, min: 0 },
  level4Count: { type: Number, default: 0, min: 0 },
  level5Count: { type: Number, default: 0, min: 0 },
  
  // Activation Status
  isActive: {
    type: Boolean,
    default: false
  },
  activatedAt: {
    type: Date
  },
  
  // Anti-Fraud Flags
  isSuspicious: {
    type: Boolean,
    default: false
  },
  fraudFlags: [{
    type: String
  }],
  lastAuditDate: {
    type: Date
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
MLMTreeSchema.index({ userId: 1 });
MLMTreeSchema.index({ referrerId: 1 });
MLMTreeSchema.index({ level: 1 });
MLMTreeSchema.index({ isActive: 1 });
MLMTreeSchema.index({ isSuspicious: 1 });
MLMTreeSchema.index({ uplineMembers: 1 });

export const MLMTree = models.MLMTree || model<IMLMTree>('MLMTree', MLMTreeSchema);
