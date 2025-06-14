
import { ObjectId } from './index';

// Presale Round Types
export interface PresaleRound {
  id: ObjectId;
  round: number;
  name: string;
  
  // Pricing
  price: number;
  minPurchase: number;
  maxPurchase?: number;
  
  // Supply
  totalTokens: number;
  soldTokens: number;
  remainingTokens: number;
  soldPercentage: number;
  
  // Timing
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  duration: number; // in days
  timeRemaining?: number; // in milliseconds
  
  // Bonus Structure
  bonusPercentage?: number;
  bonusConditions?: string;
  
  // Purchase Statistics
  totalPurchases: number;
  totalAmount: number;
  uniqueBuyers: number;
  
  // Restrictions
  isKYCRequired: boolean;
  allowedCountries?: string[];
  blockedCountries?: string[];
  
  // Metadata
  description?: string;
  features?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePresaleRoundRequest {
  round: number;
  name: string;
  price: number;
  minPurchase: number;
  maxPurchase?: number;
  totalTokens: number;
  startDate: string;
  endDate: string;
  bonusPercentage?: number;
  bonusConditions?: string;
  isKYCRequired: boolean;
  allowedCountries?: string[];
  blockedCountries?: string[];
  description?: string;
  features?: string[];
}

export interface UpdatePresaleRoundRequest {
  name?: string;
  price?: number;
  minPurchase?: number;
  maxPurchase?: number;
  totalTokens?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  bonusPercentage?: number;
  bonusConditions?: string;
  description?: string;
  features?: string[];
}

export interface PresaleStats {
  currentRound: PresaleRound;
  totalRounds: number;
  totalTokensSold: number;
  totalAmountRaised: number;
  totalBuyers: number;
  averagePurchaseAmount: number;
  salesVelocity: number; // tokens sold per day
  projectedCompletion?: Date;
}

export interface PresalePurchaseRequest {
  presaleRoundId: ObjectId;
  amount: number;
  currency: 'KES' | 'USD';
  paymentMethod: 'mpesa' | 'stripe' | 'crypto';
  paymentDetails: any;
  applyBonus?: boolean;
}

export interface PresalePurchaseCalculation {
  amount: number;
  tokenPrice: number;
  tokenAmount: number;
  bonusPercentage: number;
  bonusTokens: number;
  totalTokens: number;
  fees: {
    processingFee: number;
    networkFee?: number;
  };
  netAmount: number;
  finalAmount: number;
}

export interface PresaleAnalytics {
  dailySales: {
    date: string;
    tokensSold: number;
    amount: number;
    buyers: number;
  }[];
  topBuyers: {
    userId: ObjectId;
    username: string;
    fullName: string;
    totalPurchased: number;
    tokenAmount: number;
    firstPurchase: Date;
  }[];
  geographicDistribution: {
    country: string;
    buyers: number;
    amount: number;
    percentage: number;
  }[];
  paymentMethodDistribution: {
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
}

// Presale Configuration
export interface PresaleConfig {
  isPresaleActive: boolean;
  currentRound: number;
  autoAdvanceRounds: boolean;
  requireKYCForPurchase: boolean;
  minPurchaseGlobal: number;
  maxPurchaseGlobal?: number;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  bonusStructure: {
    earlyBird?: number;
    volume?: {
      threshold: number;
      bonus: number;
    }[];
  };
}

// Token Pricing
export interface TokenPricing {
  currentPrice: number;
  previousPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
  nextRoundPrice?: number;
  priceHistory: {
    round: number;
    price: number;
    date: Date;
  }[];
}

// Presale Dashboard Types
export interface PresaleDashboard {
  stats: PresaleStats;
  analytics: PresaleAnalytics;
  currentRound: PresaleRound;
  upcomingRounds: PresaleRound[];
  recentPurchases: {
    id: ObjectId;
    user: string;
    amount: number;
    tokenAmount: number;
    date: Date;
  }[];
}
