
import { z } from 'zod';
import { ObjectId } from './index';

export const MLMZodSchemas = {
  referralValidation: z.object({
    referralCode: z.string().min(6, 'Invalid referral code').max(12)
  }),

  commissionsFilter: z.object({
    level: z.number().min(1).max(5).optional(),
    status: z.enum(['pending', 'earned', 'locked', 'unlocked', 'withdrawn', 'cancelled']).optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    minAmount: z.number().min(0).optional(),
    maxAmount: z.number().min(0).optional()
  }),

  withdrawalRequest: z.object({
    amount: z.number().min(1, 'Amount must be positive'),
    method: z.enum(['bank_transfer', 'mpesa', 'crypto']),
    bankDetails: z.object({
      bankName: z.string(),
      accountNumber: z.string(),
      accountName: z.string(),
      branchCode: z.string().optional()
    }).optional(),
    mpesaDetails: z.object({
      phoneNumber: z.string().regex(/^\+?254[0-9]{9}$/, 'Invalid M-Pesa number')
    }).optional(),
    cryptoDetails: z.object({
      address: z.string().min(1, 'Crypto address is required'),
      network: z.enum(['bitcoin', 'ethereum', 'binancesmartchain'])
    }).optional(),
    twoFactorCode: z.string().length(6, 'Two-factor code required')
  }),

  treeNodeUpdate: z.object({
    userId: z.string(),
    newParentId: z.string().optional(),
    action: z.enum(['move', 'suspend', 'activate', 'audit'])
  })
};

export interface CommissionBreakdown {
  level: number;
  fromUser: {
    id: ObjectId;
    username: string;
    firstName: string;
    lastName: string;
  };
  purchaseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  earnedAt: Date;
  unlockDate: Date;
  status: string;
}

export interface TreeNode {
  id: ObjectId;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  level: number;
  position: number;
  directReferrals: number;
  totalVolume: number;
  isActive: boolean;
  joinedAt: Date;
  children: TreeNode[];
  parent?: TreeNode;
}

export interface MLMDashboardData {
  personalStats: {
    totalEarnings: number;
    availableBalance: number;
    lockedBalance: number;
    directReferrals: number;
    totalNetworkSize: number;
    currentLevel: number;
  };
  recentCommissions: CommissionBreakdown[];
  referralTree: TreeNode;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
  }>;
  levelPerformance: Array<{
    level: number;
    count: number;
    volume: number;
    commissions: number;
  }>;
}
