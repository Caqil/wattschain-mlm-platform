
import { ObjectId } from './index';

// MLM Tree Types
export interface MLMTreeNode {
  id: ObjectId;
  userId: ObjectId;
  user: {
    id: ObjectId;
    username: string;
    fullName: string;
    email: string;
    avatar?: string;
  };
  referrerId?: ObjectId;
  level: number;
  position: number;
  
  // Tree Structure
  uplineMembers: ObjectId[];
  downlineMembers: ObjectId[];
  
  // Statistics
  totalDownlineCount: number;
  directReferrals: number;
  totalVolume: number;
  personalVolume: number;
  
  // Level Counts
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  level5Count: number;
  
  // Status
  isActive: boolean;
  activatedAt?: Date;
  isSuspicious: boolean;
  fraudFlags: string[];
  
  createdAt: Date;
}

export interface MLMTreeStats {
  totalMembers: number;
  activeMembers: number;
  totalVolume: number;
  averageDepth: number;
  maxDepth: number;
  levelDistribution: Record<number, number>;
}

export interface MLMGenealogyTree {
  root: MLMTreeNode;
  children: MLMGenealogyTree[];
  depth: number;
}

// Commission Types
export interface Commission {
  id: ObjectId;
  userId: ObjectId;
  fromUserId: ObjectId;
  transactionId: ObjectId;
  
  // Commission Details
  amount: number;
  percentage: number;
  level: number;
  sourceAmount: number;
  
  // Lock Period
  isLocked: boolean;
  lockedUntil: Date;
  lockPeriodMonths: number;
  
  // Status
  status: CommissionStatus;
  earnedAt: Date;
  unlockedAt?: Date;
  withdrawnAt?: Date;
  
  // Withdrawal
  withdrawalTransactionId?: ObjectId;
  withdrawalMethod?: string;
  
  createdAt: Date;
}

export type CommissionStatus = 'pending' | 'earned' | 'locked' | 'unlocked' | 'withdrawn' | 'cancelled';

export interface CommissionSummary {
  totalEarned: number;
  totalLocked: number;
  totalUnlocked: number;
  totalWithdrawn: number;
  byLevel: Record<number, {
    earned: number;
    locked: number;
    unlocked: number;
    withdrawn: number;
  }>;
  nextUnlockDate?: Date;
  nextUnlockAmount?: number;
}

export interface CommissionCalculation {
  level: number;
  percentage: number;
  amount: number;
  userId: ObjectId;
  eligible: boolean;
  reason?: string;
}

// Referral Types
export interface ReferralLink {
  code: string;
  url: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  createdAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommissionsFromReferrals: number;
  topReferrals: {
    userId: ObjectId;
    username: string;
    fullName: string;
    purchaseAmount: number;
    commissionEarned: number;
    joinDate: Date;
  }[];
}

// MLM Withdrawal Types
export interface WithdrawCommissionRequest {
  commissionIds: ObjectId[];
  withdrawalMethod: 'mpesa' | 'bank_transfer' | 'crypto';
  withdrawalDetails: {
    mpesa?: {
      phoneNumber: string;
    };
    bankTransfer?: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
    crypto?: {
      address: string;
      network: string;
    };
  };
}

export interface MLMSettings {
  isMLMActive: boolean;
  minPurchaseAmount: number;
  commissionRates: Record<number, number>;
  lockPeriodMonths: number;
  maxMLMLevels: number;
  fraudDetectionEnabled: boolean;
  autoCommissionCalculation: boolean;
}

// Anti-Fraud Types
export interface FraudDetectionResult {
  isSuspicious: boolean;
  riskScore: number;
  flags: FraudFlag[];
  recommendations: string[];
}

export interface FraudFlag {
  type: 'duplicate_ip' | 'rapid_referrals' | 'suspicious_pattern' | 'device_fingerprint' | 'geographic_anomaly';
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, any>;
}
