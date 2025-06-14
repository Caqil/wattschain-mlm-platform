// MLM Constants
export const MLM_LEVELS = [1, 2, 3, 4, 5] as const;

export const MLM_COMMISSION_RATES = {
  1: 10, // 10% for direct referrals
  2: 5,  // 5% for level 2
  3: 3,  // 3% for level 3
  4: 2,  // 2% for level 4
  5: 1   // 1% for level 5
} as const;

export const MLM_CONFIG = {
  MIN_PURCHASE_AMOUNT: 100000, // 100,000 KES minimum for MLM eligibility
  COMMISSION_LOCK_PERIOD_MONTHS: 12, // 12 months lock period
  MAX_MLM_LEVELS: 5,
  TOTAL_COMMISSION_PERCENTAGE: 21, // Sum of all levels (10+5+3+2+1)
  MINIMUM_WITHDRAWAL_AMOUNT: 1000, // 1,000 KES minimum withdrawal
  FRAUD_DETECTION_ENABLED: true,
  AUTO_COMMISSION_CALCULATION: true
} as const;

// Token Constants
export const TOKEN_CONFIG = {
  SYMBOL: 'WATT',
  NAME: 'WattsChain Token',
  DECIMALS: 18,
  TOTAL_SUPPLY: 1000000000, // 1 billion tokens
  INITIAL_PRICE: 0.1, // $0.10 USD initial price
  
  // Tokenomics (percentages)
  TOKENOMICS: {
    PRESALE: 40,    // 40% for presale rounds
    TEAM: 15,       // 15% for team (vested)
    MARKETING: 20,  // 20% for marketing and partnerships
    ECOSYSTEM: 15,  // 15% for ecosystem development
    RESERVE: 10     // 10% for reserve fund
  }
} as const;

// Presale Configuration
export const PRESALE_CONFIG = {
  ROUNDS: {
    1: {
      PRICE: 0.05, // $0.05 USD
      TOKENS: 50000000, // 50M tokens
      BONUS: 25, // 25% bonus
      MIN_PURCHASE: 100000 // 100K KES
    },
    2: {
      PRICE: 0.07, // $0.07 USD
      TOKENS: 75000000, // 75M tokens
      BONUS: 20, // 20% bonus
      MIN_PURCHASE: 100000
    },
    3: {
      PRICE: 0.08, // $0.08 USD
      TOKENS: 100000000, // 100M tokens
      BONUS: 15, // 15% bonus
      MIN_PURCHASE: 100000
    },
    4: {
      PRICE: 0.09, // $0.09 USD
      TOKENS: 125000000, // 125M tokens
      BONUS: 10, // 10% bonus
      MIN_PURCHASE: 100000
    },
    5: {
      PRICE: 0.10, // $0.10 USD
      TOKENS: 50000000, // 50M tokens
      BONUS: 0, // No bonus
      MIN_PURCHASE: 100000
    }
  },
  DEFAULT_ROUND: 1,
  KYC_REQUIRED: true,
  SUPPORTED_CURRENCIES: ['KES', 'USD', 'BTC', 'ETH', 'USDT'],
  ALLOWED_COUNTRIES: ['KE', 'UG', 'TZ', 'RW', 'NG', 'GH', 'ZA'] // East/West Africa focus
} as const;

// Payment Method Configuration
export const PAYMENT_METHODS = {
  MPESA: {
    NAME: 'M-Pesa',
    CODE: 'mpesa',
    SUPPORTED_CURRENCIES: ['KES'],
    MIN_AMOUNT: 100, // 100 KES
    MAX_AMOUNT: 500000, // 500,000 KES
    PROCESSING_FEE_PERCENTAGE: 2.5,
    PROCESSING_TIME: 'instant'
  },
  STRIPE: {
    NAME: 'Credit/Debit Card',
    CODE: 'stripe',
    SUPPORTED_CURRENCIES: ['USD', 'KES'],
    MIN_AMOUNT: 5, // $5 USD or 500 KES
    MAX_AMOUNT: 10000, // $10,000 USD
    PROCESSING_FEE_PERCENTAGE: 3.5,
    PROCESSING_TIME: 'instant'
  },
  CRYPTO: {
    NAME: 'Cryptocurrency',
    CODE: 'crypto',
    SUPPORTED_CURRENCIES: ['BTC', 'ETH', 'USDT'],
    MIN_AMOUNT: 0.001, // Varies by currency
    MAX_AMOUNT: 1000000, // No practical limit
    PROCESSING_FEE_PERCENTAGE: 1.0,
    PROCESSING_TIME: '10-60 minutes'
  },
  BANK_TRANSFER: {
    NAME: 'Bank Transfer',
    CODE: 'bank_transfer',
    SUPPORTED_CURRENCIES: ['KES', 'USD'],
    MIN_AMOUNT: 1000, // 1,000 KES
    MAX_AMOUNT: 10000000, // 10M KES
    PROCESSING_FEE_PERCENTAGE: 1.5,
    PROCESSING_TIME: '1-3 business days'
  }
} as const;

// Currency Configuration
export const CURRENCIES = {
  KES: {
    NAME: 'Kenyan Shilling',
    SYMBOL: 'KSh',
    CODE: 'KES',
    DECIMAL_PLACES: 2
  },
  USD: {
    NAME: 'US Dollar',
    SYMBOL: '$',
    CODE: 'USD',
    DECIMAL_PLACES: 2
  },
  BTC: {
    NAME: 'Bitcoin',
    SYMBOL: '₿',
    CODE: 'BTC',
    DECIMAL_PLACES: 8
  },
  ETH: {
    NAME: 'Ethereum',
    SYMBOL: 'Ξ',
    CODE: 'ETH',
    DECIMAL_PLACES: 8
  },
  USDT: {
    NAME: 'Tether USD',
    SYMBOL: '₮',
    CODE: 'USDT',
    DECIMAL_PLACES: 6
  }
} as const;

// KYC Configuration
export const KYC_CONFIG = {
  REQUIRED_DOCUMENTS: ['national_id', 'proof_of_address', 'selfie'],
  OPTIONAL_DOCUMENTS: ['passport', 'driving_license'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  AUTO_APPROVAL_THRESHOLD: 85, // Score threshold for auto-approval
  MANUAL_REVIEW_THRESHOLD: 60,
  REJECTION_THRESHOLD: 40,
  MAX_RESUBMISSIONS: 3,
  VERIFICATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  DOCUMENT_TYPES: {
    NATIONAL_ID: 'national_id',
    PASSPORT: 'passport',
    DRIVING_LICENSE: 'driving_license',
    PROOF_OF_ADDRESS: 'proof_of_address',
    SELFIE: 'selfie'
  },
  
  STATUSES: {
    PENDING: 'pending',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    RESUBMIT_REQUIRED: 'resubmit_required'
  }
} as const;

// Transaction Constants
export const TRANSACTION_CONFIG = {
  STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },
  
  TYPES: {
    TOKEN_PURCHASE: 'token_purchase',
    COMMISSION_EARNING: 'commission_earning',
    COMMISSION_WITHDRAWAL: 'commission_withdrawal',
    REFERRAL_BONUS: 'referral_bonus'
  },
  
  TIMEOUT_PERIODS: {
    MPESA: 10 * 60 * 1000, // 10 minutes
    STRIPE: 30 * 60 * 1000, // 30 minutes
    CRYPTO: 60 * 60 * 1000, // 1 hour
    BANK_TRANSFER: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    SALT_ROUNDS: 12
  },
  
  SESSION: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    MAX_LOGIN_ATTEMPTS: 5,
    ACCOUNT_LOCK_DURATION: 15 * 60 * 1000, // 15 minutes
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  RATE_LIMITING: {
    LOGIN: { WINDOW: 15 * 60 * 1000, MAX_ATTEMPTS: 5 }, // 5 attempts per 15 minutes
    REGISTRATION: { WINDOW: 60 * 60 * 1000, MAX_ATTEMPTS: 3 }, // 3 attempts per hour
    PASSWORD_RESET: { WINDOW: 60 * 60 * 1000, MAX_ATTEMPTS: 3 }, // 3 attempts per hour
    KYC_SUBMISSION: { WINDOW: 24 * 60 * 60 * 1000, MAX_ATTEMPTS: 3 }, // 3 attempts per day
    WITHDRAWAL: { WINDOW: 24 * 60 * 60 * 1000, MAX_ATTEMPTS: 10 } // 10 withdrawals per day
  }
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    RESERVED_NAMES: ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'wattschain', 'support']
  },
  
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254
  },
  
  PHONE: {
    KENYA_PATTERN: /^(\+254|254|0)[7-9]\d{8}$/,
    INTERNATIONAL_PATTERN: /^\+?[1-9]\d{1,14}$/
  },
  
  REFERRAL_CODE: {
    LENGTH: 8,
    PATTERN: /^WC[A-Z0-9]{6}$/
  },
  
  AMOUNTS: {
    MIN_TOKEN_PURCHASE: 100000, // 100,000 KES
    MAX_TOKEN_PURCHASE: 10000000, // 10M KES
    MIN_WITHDRAWAL: 1000, // 1,000 KES
    MAX_DAILY_WITHDRAWAL: 1000000 // 1M KES
  }
} as const;

// API Configuration
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  },
  
  CACHE_TTL: {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 60 * 60, // 1 hour
    VERY_LONG: 24 * 60 * 60 // 24 hours
  }
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  FROM_ADDRESS: process.env.EMAIL_FROM || 'noreply@wattschain.com',
  FROM_NAME: 'WattsChain Platform',
  
  TEMPLATES: {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email-verification',
    PASSWORD_RESET: 'password-reset',
    KYC_APPROVED: 'kyc-approved',
    KYC_REJECTED: 'kyc-rejected',
    COMMISSION_EARNED: 'commission-earned',
    COMMISSION_UNLOCKED: 'commission-unlocked',
    WITHDRAWAL_CONFIRMED: 'withdrawal-confirmed',
    SECURITY_ALERT: 'security-alert'
  },
  
  RATE_LIMITS: {
    VERIFICATION_EMAIL: { WINDOW: 60 * 60 * 1000, MAX_SENDS: 3 }, // 3 per hour
    PASSWORD_RESET: { WINDOW: 60 * 60 * 1000, MAX_SENDS: 3 }, // 3 per hour
    MARKETING: { WINDOW: 24 * 60 * 60 * 1000, MAX_SENDS: 5 } // 5 per day
  }
} as const;

// Fraud Detection Constants
export const FRAUD_DETECTION = {
  RISK_SCORES: {
    LOW: 0.3,
    MEDIUM: 0.6,
    HIGH: 0.8
  },
  
  FLAGS: {
    DUPLICATE_IP: 'duplicate_ip',
    RAPID_REFERRALS: 'rapid_referrals',
    SUSPICIOUS_PATTERN: 'suspicious_pattern',
    DEVICE_FINGERPRINT: 'device_fingerprint',
    GEOGRAPHIC_ANOMALY: 'geographic_anomaly',
    VELOCITY_CHECK: 'velocity_check'
  },
  
  THRESHOLDS: {
    MAX_ACCOUNTS_PER_IP: 3,
    MAX_REFERRALS_PER_DAY: 10,
    MAX_PURCHASES_PER_HOUR: 5,
    SUSPICIOUS_AMOUNT_THRESHOLD: 1000000, // 1M KES
    TIME_BETWEEN_ACTIONS: 30 * 1000 // 30 seconds
  }
} as const;

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    DOCUMENTS: ['application/pdf'],
    ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  },
  
  DIRECTORIES: {
    KYC_DOCUMENTS: 'kyc-documents',
    AVATARS: 'avatars',
    RECEIPTS: 'receipts',
    MARKETING: 'marketing'
  }
} as const;

// Business Rules
export const BUSINESS_RULES = {
  MLM_ACTIVATION_DELAY: 24 * 60 * 60 * 1000, // 24 hours after first purchase
  COMMISSION_CALCULATION_DELAY: 60 * 1000, // 1 minute after purchase
  KYC_APPROVAL_AUTO_THRESHOLD: 85, // Auto-approve if score >= 85
  WITHDRAWAL_COOLING_PERIOD: 7 * 24 * 60 * 60 * 1000, // 7 days between withdrawals
  
  // Compliance
  LARGE_TRANSACTION_THRESHOLD: 500000, // 500K KES - requires additional verification
  DAILY_TRANSACTION_LIMIT: 2000000, // 2M KES daily limit
  MONTHLY_TRANSACTION_LIMIT: 50000000, // 50M KES monthly limit
  
  // Age restrictions
  MINIMUM_AGE: 18,
  
  // Geographic restrictions
  RESTRICTED_COUNTRIES: ['US', 'CN', 'IR', 'KP'], // US, China, Iran, North Korea
  
  // IP restrictions
  TOR_BLOCKING: true,
  VPN_DETECTION: true
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  MLM_ENABLED: true,
  KYC_REQUIRED: true,
  CRYPTO_PAYMENTS: true,
  MOBILE_PAYMENTS: true,
  FRAUD_DETECTION: true,
  AUTO_COMMISSION_CALCULATION: true,
  EMAIL_NOTIFICATIONS: true,
  SMS_NOTIFICATIONS: true,
  SOCIAL_LOGIN: true,
  TWO_FACTOR_AUTH: true,
  REFERRAL_CONTESTS: false, // Future feature
  STAKING_REWARDS: false, // Future feature
  GOVERNANCE_VOTING: false // Future feature
} as const;

// Environment-specific constants
export const ENVIRONMENT = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts',
  TOKEN_EXPIRED: 'Session expired, please login again',
  ACCESS_DENIED: 'Access denied',
  
  // Registration
  EMAIL_EXISTS: 'Email address already registered',
  USERNAME_EXISTS: 'Username already taken',
  INVALID_REFERRAL_CODE: 'Invalid referral code',
  
  // KYC
  KYC_REQUIRED: 'KYC verification required to continue',
  KYC_PENDING: 'KYC verification is pending',
  KYC_REJECTED: 'KYC verification was rejected',
  DOCUMENT_UPLOAD_FAILED: 'Failed to upload document',
  
  // Payments
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_FAILED: 'Payment processing failed',
  INVALID_AMOUNT: 'Invalid amount',
  PAYMENT_TIMEOUT: 'Payment timed out',
  
  // MLM
  MLM_NOT_ELIGIBLE: 'Not eligible for MLM commissions',
  INSUFFICIENT_PURCHASE: 'Purchase amount below minimum requirement',
  COMMISSION_LOCKED: 'Commission still locked',
  
  // General
  SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Resource not found',
  RATE_LIMITED: 'Too many requests, please try again later'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET: 'Password reset successfully',
  KYC_SUBMITTED: 'KYC documents submitted for review',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  WITHDRAWAL_SUCCESS: 'Withdrawal processed successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
} as const;

// Export all constants as a single object for easy import
export const CONSTANTS = {
  MLM_LEVELS,
  MLM_COMMISSION_RATES,
  MLM_CONFIG,
  TOKEN_CONFIG,
  PRESALE_CONFIG,
  PAYMENT_METHODS,
  CURRENCIES,
  KYC_CONFIG,
  TRANSACTION_CONFIG,
  SECURITY_CONFIG,
  VALIDATION_RULES,
  API_CONFIG,
  EMAIL_CONFIG,
  FRAUD_DETECTION,
  FILE_UPLOAD,
  BUSINESS_RULES,
  FEATURE_FLAGS,
  ENVIRONMENT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} as const;