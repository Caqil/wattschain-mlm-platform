// src/types/index.ts
import { z } from 'zod';
import { Document, Types } from 'mongoose';

// ===== COMMON TYPES & ENUMS =====

export type ObjectId = Types.ObjectId | string;

// Common Enums
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
} as const;

export const KYCStatus = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RESUBMIT_REQUIRED: 'resubmit_required'
} as const;

export const TransactionType = {
  TOKEN_PURCHASE: 'token_purchase',
  COMMISSION_EARNING: 'commission_earning',
  COMMISSION_WITHDRAWAL: 'commission_withdrawal',
  REFERRAL_BONUS: 'referral_bonus'
} as const;

export const TransactionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export const PaymentMethod = {
  MPESA: 'mpesa',
  STRIPE: 'stripe',
  CRYPTO: 'crypto',
  BANK_TRANSFER: 'bank_transfer'
} as const;

export const Currency = {
  KES: 'KES',
  USD: 'USD',
  BTC: 'BTC',
  ETH: 'ETH',
  USDT: 'USDT'
} as const;

export const CommissionStatus = {
  PENDING: 'pending',
  EARNED: 'earned',
  LOCKED: 'locked',
  UNLOCKED: 'unlocked',
  WITHDRAWN: 'withdrawn',
  CANCELLED: 'cancelled'
} as const;

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

export const IDType = {
  NATIONAL_ID: 'national_id',
  PASSPORT: 'passport',
  DRIVING_LICENSE: 'driving_license'
} as const;

export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

// ===== ZOD SCHEMAS =====

// User Schemas
export const UserZodSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  country: z.string().default('Kenya'),
  city: z.string().min(1, 'City is required'),
  referralCode: z.string(),
  referredBy: z.string().optional(),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isBanned: z.boolean().default(false),
  role: z.enum([UserRole.USER, UserRole.ADMIN, UserRole.MODERATOR]).default(UserRole.USER),
  isMLMEligible: z.boolean().default(false),
  mlmActivationDate: z.date().optional(),
  totalPurchaseAmount: z.number().min(0).default(0),
  kycStatus: z.enum([
    KYCStatus.PENDING,
    KYCStatus.SUBMITTED,
    KYCStatus.UNDER_REVIEW,
    KYCStatus.APPROVED,
    KYCStatus.REJECTED,
    KYCStatus.RESUBMIT_REQUIRED
  ]).default(KYCStatus.PENDING),
  kycCompletedAt: z.date().optional(),
  lastLogin: z.date().optional(),
  loginAttempts: z.number().default(0),
  lockUntil: z.date().optional(),
  ipAddress: z.string().optional(),
  deviceFingerprint: z.string().optional()
});

// Transaction Schemas
export const TransactionZodSchema = z.object({
  userId: z.string(),
  type: z.enum([
    TransactionType.TOKEN_PURCHASE,
    TransactionType.COMMISSION_EARNING,
    TransactionType.COMMISSION_WITHDRAWAL,
    TransactionType.REFERRAL_BONUS
  ]),
  status: z.enum([
    TransactionStatus.PENDING,
    TransactionStatus.PROCESSING,
    TransactionStatus.COMPLETED,
    TransactionStatus.FAILED,
    TransactionStatus.CANCELLED
  ]).default(TransactionStatus.PENDING),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.enum([Currency.KES, Currency.USD, Currency.BTC, Currency.ETH, Currency.USDT]),
  tokenAmount: z.number().min(0).optional(),
  tokenPrice: z.number().min(0).optional(),
  presaleRound: z.number().min(1).optional(),
  paymentMethod: z.enum([PaymentMethod.MPESA, PaymentMethod.STRIPE, PaymentMethod.CRYPTO, PaymentMethod.BANK_TRANSFER]),
  paymentReference: z.string(),
  paymentDetails: z.any().optional(),
  fromUserId: z.string().optional(),
  mlmLevel: z.number().min(1).max(5).optional(),
  relatedTransactionId: z.string().optional(),
  processingFee: z.number().min(0).default(0),
  netAmount: z.number().min(0),
  description: z.string(),
  metadata: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  processedAt: z.date().optional()
});

// Payment Schemas
export const PaymentZodSchema = z.object({
  userId: z.string(),
  transactionId: z.string(),
  amount: z.number().min(0),
  currency: z.string(),
  method: z.enum([PaymentMethod.MPESA, PaymentMethod.STRIPE, PaymentMethod.CRYPTO, PaymentMethod.BANK_TRANSFER]),
  status: z.enum([
    PaymentStatus.PENDING,
    PaymentStatus.PROCESSING,
    PaymentStatus.COMPLETED,
    PaymentStatus.FAILED,
    PaymentStatus.CANCELLED,
    PaymentStatus.REFUNDED
  ]).default(PaymentStatus.PENDING),
  reference: z.string(),
  externalReference: z.string().optional(),
  processingFee: z.number().min(0).default(0),
  networkFee: z.number().min(0).optional(),
  exchangeRate: z.number().min(0).optional(),
  webhookData: z.any().optional(),
  callbackUrl: z.string().optional(),
  initiatedAt: z.date().default(() => new Date()),
  confirmedAt: z.date().optional(),
  expiredAt: z.date().optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
  metadata: z.any().optional(),
  errorMessage: z.string().optional()
});

// Commission Schemas
export const CommissionZodSchema = z.object({
  userId: z.string(),
  fromUserId: z.string(),
  transactionId: z.string(),
  amount: z.number().min(0),
  percentage: z.number().min(0).max(100),
  level: z.number().min(1).max(5),
  sourceAmount: z.number().min(0),
  isLocked: z.boolean().default(true),
  lockedUntil: z.date(),
  lockPeriodMonths: z.number().default(12),
  status: z.enum([
    CommissionStatus.PENDING,
    CommissionStatus.EARNED,
    CommissionStatus.LOCKED,
    CommissionStatus.UNLOCKED,
    CommissionStatus.WITHDRAWN,
    CommissionStatus.CANCELLED
  ]).default(CommissionStatus.PENDING),
  earnedAt: z.date().default(() => new Date()),
  unlockedAt: z.date().optional(),
  withdrawnAt: z.date().optional(),
  withdrawalTransactionId: z.string().optional(),
  withdrawalMethod: z.string().optional(),
  withdrawalReference: z.string().optional(),
  metadata: z.any().optional(),
  notes: z.string().optional()
});

// KYC Schemas
export const KYCZodSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date(),
  nationality: z.string(),
  idNumber: z.string(),
  idType: z.enum([IDType.NATIONAL_ID, IDType.PASSPORT, IDType.DRIVING_LICENSE]),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().default('Kenya'),
  documents: z.object({
    idFront: z.string().optional(),
    idBack: z.string().optional(),
    proofOfAddress: z.string().optional(),
    selfie: z.string().optional()
  }),
  shuftipro: z.object({
    reference: z.string().optional(),
    status: z.string().optional(),
    response: z.any().optional(),
    webhookData: z.any().optional(),
    verificationUrl: z.string().optional()
  }),
  status: z.enum([
    KYCStatus.PENDING,
    KYCStatus.SUBMITTED,
    KYCStatus.UNDER_REVIEW,
    KYCStatus.APPROVED,
    KYCStatus.REJECTED,
    KYCStatus.RESUBMIT_REQUIRED
  ]).default(KYCStatus.PENDING),
  submittedAt: z.date().optional(),
  reviewedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  rejectedAt: z.date().optional(),
  reviewedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
  reviewNotes: z.string().optional(),
  verificationScore: z.number().min(0).max(100).optional(),
  riskLevel: z.enum([RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]).optional(),
  resubmissionCount: z.number().default(0),
  maxResubmissions: z.number().default(3),
  metadata: z.any().optional()
});

// Wallet Schemas
export const WalletZodSchema = z.object({
  userId: z.string(),
  tokenBalance: z.number().min(0).default(0),
  availableBalance: z.number().min(0).default(0),
  lockedBalance: z.number().min(0).default(0),
  totalCommissionsEarned: z.number().min(0).default(0),
  totalCommissionsWithdrawn: z.number().min(0).default(0),
  pendingCommissions: z.number().min(0).default(0),
  totalDeposits: z.number().min(0).default(0),
  totalWithdrawals: z.number().min(0).default(0),
  transactionCount: z.number().min(0).default(0),
  addresses: z.object({
    btc: z.string().optional(),
    eth: z.string().optional(),
    usdt: z.string().optional()
  }),
  pin: z.string().optional(),
  isLocked: z.boolean().default(false),
  lastActivity: z.date().default(() => new Date()),
  metadata: z.any().optional()
});

// MLM Tree Schemas
export const MLMTreeZodSchema = z.object({
  userId: z.string(),
  referrerId: z.string().optional(),
  level: z.number().min(0).max(5),
  position: z.number().min(1),
  leftChild: z.string().optional(),
  rightChild: z.string().optional(),
  uplineMembers: z.array(z.string()),
  downlineMembers: z.array(z.string()),
  totalDownlineCount: z.number().min(0).default(0),
  directReferrals: z.number().min(0).default(0),
  totalVolume: z.number().min(0).default(0),
  personalVolume: z.number().min(0).default(0),
  level1Count: z.number().min(0).default(0),
  level2Count: z.number().min(0).default(0),
  level3Count: z.number().min(0).default(0),
  level4Count: z.number().min(0).default(0),
  level5Count: z.number().min(0).default(0),
  isActive: z.boolean().default(false),
  activatedAt: z.date().optional(),
  isSuspicious: z.boolean().default(false),
  fraudFlags: z.array(z.string()),
  lastAuditDate: z.date().optional(),
  metadata: z.any().optional()
});

// Token Schemas
export const TokenZodSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().min(1, 'Name is required'),
  totalSupply: z.number().min(0),
  circulatingSupply: z.number().min(0),
  decimals: z.number().default(18),
  currentPresaleRound: z.number().min(1).default(1),
  currentPrice: z.number().min(0),
  tokenomics: z.object({
    presale: z.number().min(0).max(100),
    team: z.number().min(0).max(100),
    marketing: z.number().min(0).max(100),
    ecosystem: z.number().min(0).max(100),
    reserve: z.number().min(0).max(100)
  }),
  contractAddress: z.string().optional(),
  network: z.string().optional(),
  isDeployed: z.boolean().default(false),
  isTransferable: z.boolean().default(false),
  tradingStartDate: z.date().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  whitepaper: z.string().optional(),
  logo: z.string().optional()
});

// Presale Round Schemas
export const PresaleRoundZodSchema = z.object({
  round: z.number().min(1),
  name: z.string(),
  price: z.number().min(0),
  minPurchase: z.number().min(0).default(100000),
  maxPurchase: z.number().min(0).optional(),
  totalTokens: z.number().min(0),
  soldTokens: z.number().min(0).default(0),
  remainingTokens: z.number().min(0),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(false),
  bonusPercentage: z.number().min(0).max(100).optional(),
  bonusConditions: z.string().optional(),
  totalPurchases: z.number().min(0).default(0),
  totalAmount: z.number().min(0).default(0),
  uniqueBuyers: z.number().min(0).default(0),
  isKYCRequired: z.boolean().default(true),
  allowedCountries: z.array(z.string()).optional(),
  blockedCountries: z.array(z.string()).optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  metadata: z.any().optional()
});

// Settings Schemas
export const MLMSettingsZodSchema = z.object({
  commissionRates: z.object({
    level1: z.number().min(0).max(50).default(10),
    level2: z.number().min(0).max(50).default(5),
    level3: z.number().min(0).max(50).default(3),
    level4: z.number().min(0).max(50).default(2),
    level5: z.number().min(0).max(50).default(1)
  }),
  lockPeriod: z.object({
    months: z.number().min(1).max(60).default(12),
    allowEarlyUnlock: z.boolean().default(false),
    earlyUnlockPenalty: z.number().min(0).max(100).default(25),
    progressiveUnlock: z.boolean().default(false),
    progressiveUnlockPercentage: z.number().min(0).max(100).default(8.33)
  }),
  qualification: z.object({
    minimumPurchaseAmount: z.number().min(1000).default(100000),
    requireKYCApproval: z.boolean().default(true),
    requireEmailVerification: z.boolean().default(true),
    requirePhoneVerification: z.boolean().default(true),
    cooldownPeriodHours: z.number().min(0).max(168).default(24)
  }),
  treeLimits: z.object({
    maxLevels: z.number().min(1).max(10).default(5),
    maxDirectReferrals: z.number().default(-1),
    maxTreeSize: z.number().default(-1),
    allowSelfReferral: z.boolean().default(false)
  }),
  fraudPrevention: z.object({
    enableIPTracking: z.boolean().default(true),
    enableDeviceTracking: z.boolean().default(true),
    maxAccountsPerIP: z.number().min(1).default(3),
    maxAccountsPerDevice: z.number().min(1).default(2),
    suspiciousActivityThreshold: z.number().min(0).max(100).default(75),
    autoFreezeThreshold: z.number().min(0).max(100).default(90)
  }),
  calculation: z.object({
    calculateOnGrossAmount: z.boolean().default(false),
    roundToNearest: z.number().min(0.01).default(0.01),
    minimumCommissionAmount: z.number().min(1).default(100),
    maxCommissionPerUser: z.number().default(-1)
  }),
  isActive: z.boolean().default(true),
  lastModifiedBy: z.string()
});

// ===== TYPESCRIPT INTERFACES =====

// Base Document Interface
export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User Interfaces
export interface IUser extends BaseDocument {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  referralCode: string;
  referredBy?: ObjectId;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  role: keyof typeof UserRole;
  isMLMEligible: boolean;
  mlmActivationDate?: Date;
  totalPurchaseAmount: number;
  kycStatus: keyof typeof KYCStatus;
  kycCompletedAt?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  ipAddress?: string;
  deviceFingerprint?: string;
  
  // Virtual properties
  fullName: string;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
  isMLMQualified(): boolean;
}

export interface ITransaction extends BaseDocument {
  userId: ObjectId;
  type: keyof typeof TransactionType;
  status: keyof typeof TransactionStatus;
  amount: number;
  currency: keyof typeof Currency;
  tokenAmount?: number;
  tokenPrice?: number;
  presaleRound?: number;
  paymentMethod: keyof typeof PaymentMethod;
  paymentReference: string;
  paymentDetails?: any;
  fromUserId?: ObjectId;
  mlmLevel?: number;
  relatedTransactionId?: ObjectId;
  processingFee: number;
  netAmount: number;
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  processedAt?: Date;
}

export interface IPayment extends BaseDocument {
  userId: ObjectId;
  transactionId: ObjectId;
  amount: number;
  currency: string;
  method: keyof typeof PaymentMethod;
  status: keyof typeof PaymentStatus;
  
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
  
  reference: string;
  externalReference?: string;
  processingFee: number;
  networkFee?: number;
  exchangeRate?: number;
  webhookData?: any;
  callbackUrl?: string;
  initiatedAt: Date;
  confirmedAt?: Date;
  expiredAt?: Date;
  retryCount: number;
  maxRetries: number;
  metadata?: any;
  errorMessage?: string;
}

export interface ICommission extends BaseDocument {
  userId: ObjectId;
  fromUserId: ObjectId;
  transactionId: ObjectId;
  amount: number;
  percentage: number;
  level: number;
  sourceAmount: number;
  isLocked: boolean;
  lockedUntil: Date;
  lockPeriodMonths: number;
  status: keyof typeof CommissionStatus;
  earnedAt: Date;
  unlockedAt?: Date;
  withdrawnAt?: Date;
  withdrawalTransactionId?: ObjectId;
  withdrawalMethod?: string;
  withdrawalReference?: string;
  metadata?: any;
  notes?: string;
}

export interface IKYC extends BaseDocument {
  userId: ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  idNumber: string;
  idType: keyof typeof IDType;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  documents: {
    idFront?: string;
    idBack?: string;
    proofOfAddress?: string;
    selfie?: string;
  };
  shuftipro: {
    reference?: string;
    status?: string;
    response?: any;
    webhookData?: any;
    verificationUrl?: string;
  };
  status: keyof typeof KYCStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  reviewedBy?: ObjectId;
  rejectionReason?: string;
  reviewNotes?: string;
  verificationScore?: number;
  riskLevel?: keyof typeof RiskLevel;
  resubmissionCount: number;
  maxResubmissions: number;
  metadata?: any;
}

export interface IWallet extends BaseDocument {
  userId: ObjectId;
  tokenBalance: number;
  availableBalance: number;
  lockedBalance: number;
  totalCommissionsEarned: number;
  totalCommissionsWithdrawn: number;
  pendingCommissions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  addresses: {
    btc?: string;
    eth?: string;
    usdt?: string;
  };
  pin?: string;
  isLocked: boolean;
  lastActivity: Date;
  metadata?: any;
  
  // Virtual properties
  totalBalance: number;
}

export interface IMLMTree extends BaseDocument {
  userId: ObjectId;
  referrerId?: ObjectId;
  level: number;
  position: number;
  leftChild?: ObjectId;
  rightChild?: ObjectId;
  uplineMembers: ObjectId[];
  downlineMembers: ObjectId[];
  totalDownlineCount: number;
  directReferrals: number;
  totalVolume: number;
  personalVolume: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  level4Count: number;
  level5Count: number;
  isActive: boolean;
  activatedAt?: Date;
  isSuspicious: boolean;
  fraudFlags: string[];
  lastAuditDate?: Date;
  metadata?: any;
}

export interface IToken extends BaseDocument {
  symbol: string;
  name: string;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  currentPresaleRound: number;
  currentPrice: number;
  tokenomics: {
    presale: number;
    team: number;
    marketing: number;
    ecosystem: number;
    reserve: number;
  };
  contractAddress?: string;
  network?: string;
  isDeployed: boolean;
  isTransferable: boolean;
  tradingStartDate?: Date;
  description?: string;
  website?: string;
  whitepaper?: string;
  logo?: string;
}

export interface IPresaleRound extends BaseDocument {
  round: number;
  name: string;
  price: number;
  minPurchase: number;
  maxPurchase?: number;
  totalTokens: number;
  soldTokens: number;
  remainingTokens: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  bonusPercentage?: number;
  bonusConditions?: string;
  totalPurchases: number;
  totalAmount: number;
  uniqueBuyers: number;
  isKYCRequired: boolean;
  allowedCountries?: string[];
  blockedCountries?: string[];
  description?: string;
  features?: string[];
  metadata?: any;
  
  // Virtual properties
  soldPercentage: number;
}

// Settings Interfaces
export interface IMLMSettings extends BaseDocument {
  commissionRates: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  };
  lockPeriod: {
    months: number;
    allowEarlyUnlock: boolean;
    earlyUnlockPenalty: number;
    progressiveUnlock: boolean;
    progressiveUnlockPercentage: number;
  };
  qualification: {
    minimumPurchaseAmount: number;
    requireKYCApproval: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    cooldownPeriodHours: number;
  };
  treeLimits: {
    maxLevels: number;
    maxDirectReferrals: number;
    maxTreeSize: number;
    allowSelfReferral: boolean;
  };
  fraudPrevention: {
    enableIPTracking: boolean;
    enableDeviceTracking: boolean;
    maxAccountsPerIP: number;
    maxAccountsPerDevice: number;
    suspiciousActivityThreshold: number;
    autoFreezeThreshold: number;
  };
  calculation: {
    calculateOnGrossAmount: boolean;
    roundToNearest: number;
    minimumCommissionAmount: number;
    maxCommissionPerUser: number;
  };
  isActive: boolean;
  lastModifiedBy: ObjectId;
}

export interface IPresaleSettings extends BaseDocument {
  currentRound: number;
  isPresaleActive: boolean;
  autoAdvanceRounds: boolean;
  defaultRoundConfig: {
    durationDays: number;
    minPurchaseAmount: number;
    maxPurchaseAmount: number;
    bonusPercentage: number;
    kycRequired: boolean;
    allowRefunds: boolean;
    refundPeriodDays: number;
  };
  pricingStrategy: {
    basePrice: number;
    priceIncreasePercentage: number;
    maxPrice: number;
    dynamicPricing: boolean;
    bulkDiscounts: {
      enabled: boolean;
      tiers: Array<{
        minimumAmount: number;
        discountPercentage: number;
      }>;
    };
  };
  tokenAllocation: {
    totalPresaleTokens: number;
    reservePercentage: number;
    marketingAllocation: number;
    teamAllocation: number;
    maxTokensPerUser: number;
    maxTokensPerRound: number;
  };
  paymentConfig: {
    acceptedCurrencies: string[];
    paymentMethods: string[];
    processingFees: {
      mpesa: number;
      stripe: number;
      crypto: number;
      bankTransfer: number;
    };
    minimumConfirmations: {
      bitcoin: number;
      ethereum: number;
      usdt: number;
    };
  };
  vestingSchedule: {
    enabled: boolean;
    cliffPeriodMonths: number;
    vestingPeriodMonths: number;
    unlockPercentageAtTGE: number;
    monthlyUnlockPercentage: number;
  };
  referralBonuses: {
    enabled: boolean;
    referrerBonus: number;
    refereeBonus: number;
    maxBonusAmount: number;
    bonusTokensOrCash: 'tokens' | 'cash';
  };
  isActive: boolean;
  lastModifiedBy: ObjectId;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// ===== FORM TYPES =====

export type UserCreateInput = z.infer<typeof UserZodSchema>;
export type UserUpdateInput = Partial<UserCreateInput>;

export type TransactionCreateInput = z.infer<typeof TransactionZodSchema>;
export type PaymentCreateInput = z.infer<typeof PaymentZodSchema>;
export type CommissionCreateInput = z.infer<typeof CommissionZodSchema>;
export type KYCCreateInput = z.infer<typeof KYCZodSchema>;
export type WalletCreateInput = z.infer<typeof WalletZodSchema>;
export type MLMTreeCreateInput = z.infer<typeof MLMTreeZodSchema>;
export type TokenCreateInput = z.infer<typeof TokenZodSchema>;
export type PresaleRoundCreateInput = z.infer<typeof PresaleRoundZodSchema>;
export type MLMSettingsCreateInput = z.infer<typeof MLMSettingsZodSchema>;

// ===== DASHBOARD TYPES =====

export interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  totalCommissions: number;
  activeUsers: number;
  pendingKYC: number;
  completedKYC: number;
  rejectedKYC: number;
}

export interface MLMStats {
  totalMembers: number;
  totalLevels: number;
  totalCommissions: number;
  averageCommissionPerUser: number;
  topPerformers: Array<{
    userId: ObjectId;
    username: string;
    totalEarnings: number;
    directReferrals: number;
  }>;
}

export interface TransactionAnalytics {
  totalVolume: number;
  transactionCount: number;
  averageTransactionSize: number;
  paymentMethodBreakdown: Record<string, number>;
  currencyBreakdown: Record<string, number>;
  dailyVolume: Array<{
    date: string;
    volume: number;
    count: number;
  }>;
}

// ===== UTILITY TYPES =====

export type WithId<T> = T & { _id: ObjectId };
export type WithoutId<T> = Omit<T, '_id'>;
export type UpdateInput<T> = Partial<WithoutId<T>>;
export type CreateInput<T> = WithoutId<T>;

// Populate Types
export interface PopulatedTransaction extends Omit<ITransaction, 'userId' | 'fromUserId'> {
  userId: IUser;
  fromUserId?: IUser;
}

export interface PopulatedCommission extends Omit<ICommission, 'userId' | 'fromUserId'> {
  userId: IUser;
  fromUserId: IUser;
}

export interface PopulatedMLMTree extends Omit<IMLMTree, 'userId' | 'referrerId'> {
  userId: IUser;
  referrerId?: IUser;
}

// ===== AUTHENTICATION TYPES =====

export interface AuthUser {
  id: ObjectId;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: keyof typeof UserRole;
  isEmailVerified: boolean;
  isMLMEligible: boolean;
  kycStatus: keyof typeof KYCStatus;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  referralCode?: string;
  agreeToTerms: boolean;
}

export interface JWTPayload {
  userId: ObjectId;
  email: string;
  role: keyof typeof UserRole;
  iat: number;
  exp: number;
}

// ===== ERROR TYPES =====

export class ValidationError extends Error {
  public errors: Record<string, string[]>;
  
  constructor(errors: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class PaymentError extends Error {
  public code: string;
  public provider: string;
  
  constructor(message: string, code: string, provider: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.provider = provider;
  }
}

// ===== WEBHOOK TYPES =====

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  signature?: string;
}

export interface MPesaWebhookPayload extends WebhookPayload {
  event: 'payment.completed' | 'payment.failed';
  data: {
    TransactionType: string;
    TransID: string;
    TransTime: string;
    TransAmount: number;
    BusinessShortCode: string;
    BillRefNumber: string;
    InvoiceNumber: string;
    OrgAccountBalance: number;
    ThirdPartyTransID: string;
    MSISDN: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
  };
}

export interface StripeWebhookPayload extends WebhookPayload {
  event: 'payment_intent.succeeded' | 'payment_intent.payment_failed';
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
      metadata: Record<string, string>;
    };
  };
}

// ===== AUDIT LOG TYPES =====

export interface AuditLog {
  _id: ObjectId;
  userId: ObjectId;
  action: string;
  resource: string;
  resourceId: ObjectId;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// ===== NOTIFICATION TYPES =====

export interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  expiresAt?: Date;
  createdAt: Date;
}

// ===== EXPORT ALL =====
export * from './auth';
export * from './kyc';
export * from './mlm';
export * from './payment';
export * from './presale';
export * from './transaction';
export * from './user';