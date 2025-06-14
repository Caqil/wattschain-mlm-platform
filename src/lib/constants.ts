export const APP_CONFIG = {
  name: 'WattsChain',
  description: 'Powering the Future of Energy',
  version: '1.0.0',
  author: 'WattsChain Team',
  website: 'https://wattschain.com',
  supportEmail: 'support@wattschain.com',
  supportPhone: '+254700000000',
} as const;

export const BUSINESS_RULES = {
  mlm: {
    maxLevels: 5,
    commissionRates: {
      level1: 10,
      level2: 5,
      level3: 3,
      level4: 2,
      level5: 1,
    },
    lockPeriodMonths: 12,
    minimumPurchaseAmount: 100000, // KES
  },
  kyc: {
    maxResubmissions: 3,
    documentTypes: ['national_id', 'passport', 'driving_license'],
    requiredDocuments: ['idFront', 'proofOfAddress', 'selfie'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
  payments: {
    minimumAmount: 100, // KES
    maximumAmount: 10000000, // KES
    processingFees: {
      mpesa: 0,
      stripe: 3.4,
      crypto: 1,
      bankTransfer: 1.5,
    },
    supportedCurrencies: ['KES', 'USD', 'BTC', 'ETH', 'USDT'],
    supportedMethods: ['mpesa', 'stripe', 'crypto', 'bank_transfer'],
  },
  security: {
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 120,
    passwordMinLength: 8,
    tokenExpiryHours: 24,
    refreshTokenExpiryDays: 7,
    sessionTimeoutMinutes: 480, // 8 hours
  },
} as const;

export const UI_CONFIG = {
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    defaultPage: 1,
  },
  notifications: {
    autoHideDuration: 5000,
    maxNotifications: 5,
  },
  animations: {
    duration: 200,
    easing: 'ease-in-out',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  user: {
    profile: '/user/profile',
    transactions: '/user/transactions',
    wallet: '/user/wallet',
    avatar: '/user/avatar',
  },
  mlm: {
    tree: '/mlm/tree',
    referrals: '/mlm/referrals',
    commissions: '/mlm/commissions',
    withdraw: '/mlm/withdraw',
    stats: '/mlm/stats',
  },
  kyc: {
    status: '/kyc/status',
    submit: '/kyc/submit',
    upload: '/kyc/upload',
    requirements: '/kyc/requirements',
  },
  payment: {
    create: '/payment/create',
    methods: '/payment/methods',
    verify: '/payment/verify',
    stripe: '/payment/stripe',
    mpesa: '/payment/mpesa',
    crypto: '/payment/crypto',
  },
  admin: {
    users: '/admin/users',
    transactions: '/admin/transactions',
    kycReviews: '/admin/kyc-reviews',
    settings: '/admin/settings',
    reports: '/admin/reports',
  },
} as const;

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // Authorization errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business logic errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  MINIMUM_AMOUNT_NOT_MET: 'MINIMUM_AMOUNT_NOT_MET',
  KYC_NOT_APPROVED: 'KYC_NOT_APPROVED',
  MLM_NOT_ELIGIBLE: 'MLM_NOT_ELIGIBLE',
  COMMISSION_LOCKED: 'COMMISSION_LOCKED',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;