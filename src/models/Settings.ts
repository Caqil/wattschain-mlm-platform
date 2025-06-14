// src/models/Settings.ts
import { Schema, model, models, Document } from 'mongoose';

// ===== MLM COMMISSION SETTINGS =====
export interface IMLMSettings extends Document {
  _id: string;
  
  // Commission Structure
  commissionRates: {
    level1: number; // Default: 10%
    level2: number; // Default: 5%
    level3: number; // Default: 3%
    level4: number; // Default: 2%
    level5: number; // Default: 1%
  };
  
  // Lock Period Settings
  lockPeriod: {
    months: number; // Default: 12 months
    allowEarlyUnlock: boolean; // Default: false
    earlyUnlockPenalty: number; // Percentage penalty for early unlock
    progressiveUnlock: boolean; // Allow monthly partial unlocks
    progressiveUnlockPercentage: number; // Monthly unlock percentage
  };
  
  // Qualification Requirements
  qualification: {
    minimumPurchaseAmount: number; // Default: 100,000 KES
    requireKYCApproval: boolean; // Default: true
    requireEmailVerification: boolean; // Default: true
    requirePhoneVerification: boolean; // Default: true
    cooldownPeriodHours: number; // Hours between purchases
  };
  
  // Tree Structure Limits
  treeLimits: {
    maxLevels: number; // Default: 5
    maxDirectReferrals: number; // Default: unlimited (-1)
    maxTreeSize: number; // Default: unlimited (-1)
    allowSelfReferral: boolean; // Default: false
  };
  
  // Anti-Fraud Settings
  fraudPrevention: {
    enableIPTracking: boolean;
    enableDeviceTracking: boolean;
    maxAccountsPerIP: number;
    maxAccountsPerDevice: number;
    suspiciousActivityThreshold: number;
    autoFreezeThreshold: number;
  };
  
  // Commission Calculation
  calculation: {
    calculateOnGrossAmount: boolean; // Before or after fees
    roundToNearest: number; // Round to nearest cent/kobo
    minimumCommissionAmount: number; // Min amount to earn commission
    maxCommissionPerUser: number; // Max commission per user per month
  };
  
  isActive: boolean;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MLMSettingsSchema = new Schema<IMLMSettings>({
  commissionRates: {
    level1: { type: Number, required: true, default: 10, min: 0, max: 50 },
    level2: { type: Number, required: true, default: 5, min: 0, max: 50 },
    level3: { type: Number, required: true, default: 3, min: 0, max: 50 },
    level4: { type: Number, required: true, default: 2, min: 0, max: 50 },
    level5: { type: Number, required: true, default: 1, min: 0, max: 50 }
  },
  
  lockPeriod: {
    months: { type: Number, required: true, default: 12, min: 1, max: 60 },
    allowEarlyUnlock: { type: Boolean, default: false },
    earlyUnlockPenalty: { type: Number, default: 25, min: 0, max: 100 },
    progressiveUnlock: { type: Boolean, default: false },
    progressiveUnlockPercentage: { type: Number, default: 8.33, min: 0, max: 100 }
  },
  
  qualification: {
    minimumPurchaseAmount: { type: Number, required: true, default: 100000, min: 1000 },
    requireKYCApproval: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: true },
    cooldownPeriodHours: { type: Number, default: 24, min: 0, max: 168 }
  },
  
  treeLimits: {
    maxLevels: { type: Number, required: true, default: 5, min: 1, max: 10 },
    maxDirectReferrals: { type: Number, default: -1 }, // -1 = unlimited
    maxTreeSize: { type: Number, default: -1 }, // -1 = unlimited
    allowSelfReferral: { type: Boolean, default: false }
  },
  
  fraudPrevention: {
    enableIPTracking: { type: Boolean, default: true },
    enableDeviceTracking: { type: Boolean, default: true },
    maxAccountsPerIP: { type: Number, default: 3, min: 1 },
    maxAccountsPerDevice: { type: Number, default: 2, min: 1 },
    suspiciousActivityThreshold: { type: Number, default: 75, min: 0, max: 100 },
    autoFreezeThreshold: { type: Number, default: 90, min: 0, max: 100 }
  },
  
  calculation: {
    calculateOnGrossAmount: { type: Boolean, default: false },
    roundToNearest: { type: Number, default: 0.01, min: 0.01 },
    minimumCommissionAmount: { type: Number, default: 100, min: 1 },
    maxCommissionPerUser: { type: Number, default: -1 } // -1 = unlimited
  },
  
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: String, ref: 'User', required: true }
}, { timestamps: true });

// ===== PRESALE SETTINGS =====
export interface IPresaleSettings extends Document {
  _id: string;
  
  // Current Active Settings
  currentRound: number;
  isPresaleActive: boolean;
  autoAdvanceRounds: boolean;
  
  // Default Round Configuration
  defaultRoundConfig: {
    durationDays: number;
    minPurchaseAmount: number;
    maxPurchaseAmount: number;
    bonusPercentage: number;
    kycRequired: boolean;
    allowRefunds: boolean;
    refundPeriodDays: number;
  };
  
  // Pricing Strategy
  pricingStrategy: {
    basePrice: number; // Starting price for first round
    priceIncreasePercentage: number; // Price increase per round
    maxPrice: number; // Maximum price cap
    dynamicPricing: boolean; // Enable supply/demand pricing
    bulkDiscounts: {
      enabled: boolean;
      tiers: Array<{
        minimumAmount: number;
        discountPercentage: number;
      }>;
    };
  };
  
  // Token Allocation
  tokenAllocation: {
    totalPresaleTokens: number;
    reservePercentage: number; // % kept in reserve
    marketingAllocation: number;
    teamAllocation: number;
    maxTokensPerUser: number;
    maxTokensPerRound: number;
  };
  
  // Payment Configuration
  paymentConfig: {
    acceptedCurrencies: string[]; // ['KES', 'USD', 'BTC', 'ETH', 'USDT']
    paymentMethods: string[]; // ['mpesa', 'stripe', 'crypto', 'bank_transfer']
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
  
  // Vesting Schedule
  vestingSchedule: {
    enabled: boolean;
    cliffPeriodMonths: number; // Initial lock period
    vestingPeriodMonths: number; // Total vesting period
    unlockPercentageAtTGE: number; // % unlocked at Token Generation Event
    monthlyUnlockPercentage: number; // % unlocked monthly after cliff
  };
  
  // Referral Bonuses for Presale
  referralBonuses: {
    enabled: boolean;
    referrerBonus: number; // % bonus for referrer
    refereeBonus: number; // % bonus for referee
    maxBonusAmount: number; // Max bonus per referral
    bonusTokensOrCash: 'tokens' | 'cash'; // Type of bonus
  };
  
  isActive: boolean;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PresaleSettingsSchema = new Schema<IPresaleSettings>({
  currentRound: { type: Number, required: true, default: 1, min: 1 },
  isPresaleActive: { type: Boolean, default: true },
  autoAdvanceRounds: { type: Boolean, default: false },
  
  defaultRoundConfig: {
    durationDays: { type: Number, default: 30, min: 1, max: 365 },
    minPurchaseAmount: { type: Number, default: 10000, min: 100 },
    maxPurchaseAmount: { type: Number, default: 10000000, min: 1000 },
    bonusPercentage: { type: Number, default: 20, min: 0, max: 100 },
    kycRequired: { type: Boolean, default: true },
    allowRefunds: { type: Boolean, default: true },
    refundPeriodDays: { type: Number, default: 7, min: 0, max: 30 }
  },
  
  pricingStrategy: {
    basePrice: { type: Number, required: true, default: 0.001, min: 0.0001 },
    priceIncreasePercentage: { type: Number, default: 15, min: 0, max: 100 },
    maxPrice: { type: Number, default: 1, min: 0.001 },
    dynamicPricing: { type: Boolean, default: false },
    bulkDiscounts: {
      enabled: { type: Boolean, default: false },
      tiers: [{
        minimumAmount: { type: Number, min: 1000 },
        discountPercentage: { type: Number, min: 0, max: 50 }
      }]
    }
  },
  
  tokenAllocation: {
    totalPresaleTokens: { type: Number, required: true, min: 1000000 },
    reservePercentage: { type: Number, default: 10, min: 0, max: 50 },
    marketingAllocation: { type: Number, default: 1000000, min: 0 },
    teamAllocation: { type: Number, default: 500000, min: 0 },
    maxTokensPerUser: { type: Number, default: 1000000, min: 1000 },
    maxTokensPerRound: { type: Number, default: 10000000, min: 100000 }
  },
  
  paymentConfig: {
    acceptedCurrencies: [{ type: String, enum: ['KES', 'USD', 'BTC', 'ETH', 'USDT'] }],
    paymentMethods: [{ type: String, enum: ['mpesa', 'stripe', 'crypto', 'bank_transfer'] }],
    processingFees: {
      mpesa: { type: Number, default: 2.5, min: 0, max: 10 },
      stripe: { type: Number, default: 3.4, min: 0, max: 10 },
      crypto: { type: Number, default: 1, min: 0, max: 10 },
      bankTransfer: { type: Number, default: 1.5, min: 0, max: 10 }
    },
    minimumConfirmations: {
      bitcoin: { type: Number, default: 3, min: 1, max: 6 },
      ethereum: { type: Number, default: 12, min: 1, max: 35 },
      usdt: { type: Number, default: 12, min: 1, max: 35 }
    }
  },
  
  vestingSchedule: {
    enabled: { type: Boolean, default: false },
    cliffPeriodMonths: { type: Number, default: 6, min: 0, max: 24 },
    vestingPeriodMonths: { type: Number, default: 24, min: 1, max: 60 },
    unlockPercentageAtTGE: { type: Number, default: 25, min: 0, max: 100 },
    monthlyUnlockPercentage: { type: Number, default: 12.5, min: 0, max: 100 }
  },
  
  referralBonuses: {
    enabled: { type: Boolean, default: true },
    referrerBonus: { type: Number, default: 5, min: 0, max: 20 },
    refereeBonus: { type: Number, default: 2, min: 0, max: 10 },
    maxBonusAmount: { type: Number, default: 100000, min: 1000 },
    bonusTokensOrCash: { type: String, enum: ['tokens', 'cash'], default: 'tokens' }
  },
  
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: String, ref: 'User', required: true }
}, { timestamps: true });

// ===== PLATFORM SETTINGS =====
export interface IPlatformSettings extends Document {
  _id: string;
  
  // General Platform Settings
  platform: {
    name: string;
    tagline: string;
    description: string;
    website: string;
    supportEmail: string;
    supportPhone: string;
    timezone: string;
    defaultLanguage: string;
    enabledLanguages: string[];
  };
  
  // Security Settings
  security: {
    twoFactorRequired: boolean;
    passwordComplexityRules: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    sessionTimeout: number; // Minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // Minutes
    enableCaptcha: boolean;
    captchaThreshold: number; // Failed attempts before captcha
  };
  
  // KYC/AML Settings
  kyc: {
    required: boolean;
    provider: 'shuftipro' | 'jumio' | 'onfido';
    autoApprove: boolean;
    manualReviewThreshold: number; // Risk score threshold
    requiredDocuments: string[];
    allowedCountries: string[];
    blockedCountries: string[];
    verificationLevels: {
      basic: {
        maxTransactionAmount: number;
        maxMonthlyAmount: number;
        requiredDocuments: string[];
      };
      advanced: {
        maxTransactionAmount: number;
        maxMonthlyAmount: number;
        requiredDocuments: string[];
      };
      premium: {
        maxTransactionAmount: number;
        maxMonthlyAmount: number;
        requiredDocuments: string[];
      };
    };
  };
  
  // Communication Settings
  communications: {
    emailProvider: 'sendgrid' | 'mailgun' | 'ses';
    smsProvider: 'twilio' | 'africastalking' | 'termii';
    enableEmailNotifications: boolean;
    enableSMSNotifications: boolean;
    enablePushNotifications: boolean;
    notificationTypes: {
      transactionUpdates: boolean;
      commissionEarned: boolean;
      kycUpdates: boolean;
      systemAlerts: boolean;
      marketingEmails: boolean;
    };
  };
  
  // Withdrawal Settings
  withdrawals: {
    enabled: boolean;
    methods: string[]; // ['bank_transfer', 'mpesa', 'crypto']
    minimumAmounts: {
      bankTransfer: number;
      mpesa: number;
      crypto: number;
    };
    maximumAmounts: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    processingFees: {
      bankTransfer: number;
      mpesa: number;
      crypto: number;
    };
    processingTimes: {
      bankTransfer: string; // "1-3 business days"
      mpesa: string; // "instant"
      crypto: string; // "within 24 hours"
    };
    autoApprovalThreshold: number; // Auto-approve below this amount
    requireTwoFactorAuth: boolean;
  };
  
  // Referral System Settings
  referrals: {
    enabled: boolean;
    requireMinimumPurchase: boolean;
    minimumPurchaseAmount: number;
    maxReferralDepth: number;
    referralCodeLength: number;
    referralCodePrefix: string;
    allowCodeCustomization: boolean;
    trackingCookieDuration: number; // Days
  };
  
  // Maintenance Mode
  maintenance: {
    enabled: boolean;
    message: string;
    allowAdminAccess: boolean;
    expectedDuration: string;
    affectedServices: string[];
  };
  
  isActive: boolean;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>({
  platform: {
    name: { type: String, required: true, default: 'WattsChain' },
    tagline: { type: String, default: 'Powering the Future of Energy' },
    description: { type: String, default: 'Blockchain-based renewable energy token platform' },
    website: { type: String, default: 'https://wattschain.com' },
    supportEmail: { type: String, required: true, default: 'support@wattschain.com' },
    supportPhone: { type: String, default: '+254700000000' },
    timezone: { type: String, default: 'Africa/Nairobi' },
    defaultLanguage: { type: String, default: 'en' },
    enabledLanguages: [{ type: String, default: ['en', 'sw'] }]
  },
  
  security: {
    twoFactorRequired: { type: Boolean, default: false },
    passwordComplexityRules: {
      minLength: { type: Number, default: 8, min: 6, max: 32 },
      requireUppercase: { type: Boolean, default: true },
      requireLowercase: { type: Boolean, default: true },
      requireNumbers: { type: Boolean, default: true },
      requireSymbols: { type: Boolean, default: false }
    },
    sessionTimeout: { type: Number, default: 480, min: 60, max: 1440 }, // 8 hours default
    maxLoginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    lockoutDuration: { type: Number, default: 30, min: 15, max: 1440 }, // 30 minutes default
    enableCaptcha: { type: Boolean, default: true },
    captchaThreshold: { type: Number, default: 3, min: 1, max: 5 }
  },
  
  kyc: {
    required: { type: Boolean, default: true },
    provider: { type: String, enum: ['shuftipro', 'jumio', 'onfido'], default: 'shuftipro' },
    autoApprove: { type: Boolean, default: false },
    manualReviewThreshold: { type: Number, default: 70, min: 0, max: 100 },
    requiredDocuments: [{ type: String, default: ['national_id', 'proof_of_address'] }],
    allowedCountries: [{ type: String, default: ['KE', 'UG', 'TZ', 'RW'] }],
    blockedCountries: [{ type: String, default: [''] }],
    verificationLevels: {
      basic: {
        maxTransactionAmount: { type: Number, default: 50000 },
        maxMonthlyAmount: { type: Number, default: 200000 },
        requiredDocuments: [{ type: String, default: ['national_id'] }]
      },
      advanced: {
        maxTransactionAmount: { type: Number, default: 500000 },
        maxMonthlyAmount: { type: Number, default: 2000000 },
        requiredDocuments: [{ type: String, default: ['national_id', 'proof_of_address'] }]
      },
      premium: {
        maxTransactionAmount: { type: Number, default: -1 }, // Unlimited
        maxMonthlyAmount: { type: Number, default: -1 }, // Unlimited
        requiredDocuments: [{ type: String, default: ['national_id', 'proof_of_address', 'bank_statement'] }]
      }
    }
  },
  
  communications: {
    emailProvider: { type: String, enum: ['sendgrid', 'mailgun', 'ses'], default: 'sendgrid' },
    smsProvider: { type: String, enum: ['twilio', 'africastalking', 'termii'], default: 'africastalking' },
    enableEmailNotifications: { type: Boolean, default: true },
    enableSMSNotifications: { type: Boolean, default: true },
    enablePushNotifications: { type: Boolean, default: true },
    notificationTypes: {
      transactionUpdates: { type: Boolean, default: true },
      commissionEarned: { type: Boolean, default: true },
      kycUpdates: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    }
  },
  
  withdrawals: {
    enabled: { type: Boolean, default: true },
    methods: [{ type: String, enum: ['bank_transfer', 'mpesa', 'crypto'], default: ['mpesa', 'bank_transfer'] }],
    minimumAmounts: {
      bankTransfer: { type: Number, default: 1000 },
      mpesa: { type: Number, default: 100 },
      crypto: { type: Number, default: 5000 }
    },
    maximumAmounts: {
      daily: { type: Number, default: 1000000 },
      weekly: { type: Number, default: 5000000 },
      monthly: { type: Number, default: 20000000 }
    },
    processingFees: {
      bankTransfer: { type: Number, default: 150 }, // Fixed fee in KES
      mpesa: { type: Number, default: 0 }, // No fee for M-Pesa
      crypto: { type: Number, default: 2.5 } // Percentage fee
    },
    processingTimes: {
      bankTransfer: { type: String, default: '1-3 business days' },
      mpesa: { type: String, default: 'instant' },
      crypto: { type: String, default: 'within 24 hours' }
    },
    autoApprovalThreshold: { type: Number, default: 50000 },
    requireTwoFactorAuth: { type: Boolean, default: true }
  },
  
  referrals: {
    enabled: { type: Boolean, default: true },
    requireMinimumPurchase: { type: Boolean, default: true },
    minimumPurchaseAmount: { type: Number, default: 100000 },
    maxReferralDepth: { type: Number, default: 5, min: 1, max: 10 },
    referralCodeLength: { type: Number, default: 8, min: 6, max: 12 },
    referralCodePrefix: { type: String, default: 'WC' },
    allowCodeCustomization: { type: Boolean, default: false },
    trackingCookieDuration: { type: Number, default: 30, min: 1, max: 365 }
  },
  
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'Platform is under maintenance. Please check back later.' },
    allowAdminAccess: { type: Boolean, default: true },
    expectedDuration: { type: String, default: '2 hours' },
    affectedServices: [{ type: String, default: [] }]
  },
  
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: String, ref: 'User', required: true }
}, { timestamps: true });

// ===== PAYMENT GATEWAY SETTINGS =====
export interface IPaymentGatewaySettings extends Document {
  _id: string;
  
  // M-Pesa Configuration
  mpesa: {
    enabled: boolean;
    environment: 'sandbox' | 'production';
    businessShortCode: string;
    consumerKey: string;
    consumerSecret: string;
    passkey: string;
    callbackUrl: string;
    timeoutUrl: string;
    resultUrl: string;
    queueTimeoutUrl: string;
    accountReference: string;
    transactionDesc: string;
  };
  
  // Stripe Configuration
  stripe: {
    enabled: boolean;
    environment: 'test' | 'live';
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    supportedCurrencies: string[];
    statementDescriptor: string;
    captureMethod: 'automatic' | 'manual';
  };
  
  // Crypto Configuration
  crypto: {
    enabled: boolean;
    supportedNetworks: string[];
    walletAddresses: {
      bitcoin: string;
      ethereum: string;
      binancesmartchain: string;
      polygon: string;
    };
    minimumConfirmations: {
      bitcoin: number;
      ethereum: number;
      binancesmartchain: number;
      polygon: number;
    };
    processingFeePercentage: number;
    hotWalletThreshold: number; // Amount before moving to cold storage
  };
  
  // Bank Transfer Configuration
  bankTransfer: {
    enabled: boolean;
    supportedBanks: Array<{
      bankName: string;
      bankCode: string;
      accountNumber: string;
      accountName: string;
      swiftCode?: string;
      branchCode?: string;
    }>;
    verificationRequired: boolean;
    processingDays: number;
    cutoffTime: string; // Time after which next day processing
  };
  
  // Global Payment Settings
  global: {
    baseCurrency: string; // KES
    exchangeRateProvider: 'fixer' | 'openexchangerates' | 'currencylayer';
    exchangeRateApiKey: string;
    rateUpdateInterval: number; // Minutes
    rateCacheExpiry: number; // Minutes
    maxSlippage: number; // Percentage
    enableDynamicPricing: boolean;
  };
  
  isActive: boolean;
  lastModifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentGatewaySettingsSchema = new Schema<IPaymentGatewaySettings>({
  mpesa: {
    enabled: { type: Boolean, default: true },
    environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    businessShortCode: { type: String, required: true },
    consumerKey: { type: String, required: true },
    consumerSecret: { type: String, required: true },
    passkey: { type: String, required: true },
    callbackUrl: { type: String, required: true },
    timeoutUrl: { type: String, required: true },
    resultUrl: { type: String, required: true },
    queueTimeoutUrl: { type: String, required: true },
    accountReference: { type: String, default: 'WattsChain' },
    transactionDesc: { type: String, default: 'Token Purchase' }
  },
  
  stripe: {
    enabled: { type: Boolean, default: true },
    environment: { type: String, enum: ['test', 'live'], default: 'test' },
    publishableKey: { type: String, required: true },
    secretKey: { type: String, required: true },
    webhookSecret: { type: String, required: true },
    supportedCurrencies: [{ type: String, default: ['usd', 'eur', 'gbp'] }],
    statementDescriptor: { type: String, default: 'WATTSCHAIN' },
    captureMethod: { type: String, enum: ['automatic', 'manual'], default: 'automatic' }
  },
  
  crypto: {
    enabled: { type: Boolean, default: true },
    supportedNetworks: [{ type: String, default: ['bitcoin', 'ethereum', 'binancesmartchain'] }],
    walletAddresses: {
      bitcoin: { type: String },
      ethereum: { type: String },
      binancesmartchain: { type: String },
      polygon: { type: String }
    },
    minimumConfirmations: {
      bitcoin: { type: Number, default: 3 },
      ethereum: { type: Number, default: 12 },
      binancesmartchain: { type: Number, default: 3 },
      polygon: { type: Number, default: 20 }
    },
    processingFeePercentage: { type: Number, default: 1, min: 0, max: 10 },
    hotWalletThreshold: { type: Number, default: 100000 } // KES equivalent
  },
  
  bankTransfer: {
    enabled: { type: Boolean, default: true },
    supportedBanks: [{
      bankName: { type: String, required: true },
      bankCode: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true },
      swiftCode: { type: String },
      branchCode: { type: String }
    }],
    verificationRequired: { type: Boolean, default: true },
    processingDays: { type: Number, default: 1, min: 0, max: 5 },
    cutoffTime: { type: String, default: '16:00' } // 4 PM EAT
  },
  
  global: {
    baseCurrency: { type: String, default: 'KES' },
    exchangeRateProvider: { type: String, enum: ['fixer', 'openexchangerates', 'currencylayer'], default: 'fixer' },
    exchangeRateApiKey: { type: String, required: true },
    rateUpdateInterval: { type: Number, default: 60, min: 15, max: 1440 }, // 1 hour
    rateCacheExpiry: { type: Number, default: 120, min: 30, max: 2880 }, // 2 hours
    maxSlippage: { type: Number, default: 2, min: 0, max: 10 }, // 2%
    enableDynamicPricing: { type: Boolean, default: false }
  },
  
  isActive: { type: Boolean, default: true },
  lastModifiedBy: { type: String, ref: 'User', required: true }
}, { timestamps: true });

// Export models
export const MLMSettings = models.MLMSettings || model<IMLMSettings>('MLMSettings', MLMSettingsSchema);
export const PresaleSettings = models.PresaleSettings || model<IPresaleSettings>('PresaleSettings', PresaleSettingsSchema);
export const PlatformSettings = models.PlatformSettings || model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);
export const PaymentGatewaySettings = models.PaymentGatewaySettings || model<IPaymentGatewaySettings>('PaymentGatewaySettings', PaymentGatewaySettingsSchema);

// ===== SETTINGS HELPER FUNCTIONS =====

// Get current MLM settings (singleton pattern)
export const getCurrentMLMSettings = async (): Promise<IMLMSettings> => {
  let settings = await MLMSettings.findOne({ isActive: true });
  if (!settings) {
    // Create default settings if none exist
    settings = new MLMSettings({
      lastModifiedBy: 'system',
      isActive: true
    });
    await settings.save();
  }
  return settings;
};

// Get current presale settings (singleton pattern)
export const getCurrentPresaleSettings = async (): Promise<IPresaleSettings> => {
  let settings = await PresaleSettings.findOne({ isActive: true });
  if (!settings) {
    // Create default settings if none exist
    settings = new PresaleSettings({
      lastModifiedBy: 'system',
      isActive: true
    });
    await settings.save();
  }
  return settings;
};

// Get current platform settings (singleton pattern)
export const getCurrentPlatformSettings = async (): Promise<IPlatformSettings> => {
  let settings = await PlatformSettings.findOne({ isActive: true });
  if (!settings) {
    // Create default settings if none exist
    settings = new PlatformSettings({
      lastModifiedBy: 'system',
      isActive: true
    });
    await settings.save();
  }
  return settings;
};

// Get current payment gateway settings (singleton pattern)
export const getCurrentPaymentGatewaySettings = async (): Promise<IPaymentGatewaySettings> => {
  let settings = await PaymentGatewaySettings.findOne({ isActive: true });
  if (!settings) {
    // Create default settings if none exist
    settings = new PaymentGatewaySettings({
      lastModifiedBy: 'system',
      isActive: true,
      mpesa: {
        businessShortCode: process.env.MPESA_BUSINESS_SHORT_CODE || '',
        consumerKey: process.env.MPESA_CONSUMER_KEY || '',
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
        passkey: process.env.MPESA_PASSKEY || '',
        callbackUrl: process.env.MPESA_CALLBACK_URL || '',
        timeoutUrl: process.env.MPESA_TIMEOUT_URL || '',
        resultUrl: process.env.MPESA_RESULT_URL || '',
        queueTimeoutUrl: process.env.MPESA_QUEUE_TIMEOUT_URL || ''
      },
      stripe: {
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY || '',
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
      },
      global: {
        exchangeRateApiKey: process.env.EXCHANGE_RATE_API_KEY || ''
      }
    });
    await settings.save();
  }
  return settings;
};

// Update settings with audit trail
export const updateSettings = async (
  model: any,
  updates: any,
  modifiedBy: string
): Promise<any> => {
  const settings = await model.findOne({ isActive: true });
  if (!settings) {
    throw new Error('Settings not found');
  }
  
  // Create audit trail
  const auditEntry = {
    settingsType: model.modelName,
    oldValues: settings.toObject(),
    newValues: { ...settings.toObject(), ...updates },
    modifiedBy,
    modifiedAt: new Date()
  };
  
  // You can save audit trail to a separate collection if needed
  // await SettingsAudit.create(auditEntry);
  
  // Update settings
  Object.assign(settings, updates);
  settings.lastModifiedBy = modifiedBy;
  await settings.save();
  
  return settings;
};