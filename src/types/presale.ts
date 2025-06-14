
import { z } from 'zod';

export const PresaleZodSchemas = {
  roundConfig: z.object({
    round: z.number().min(1),
    name: z.string().min(1, 'Round name is required'),
    price: z.number().min(0.0001, 'Price must be positive'),
    totalTokens: z.number().min(1000, 'Minimum 1,000 tokens required'),
    minPurchase: z.number().min(100, 'Minimum purchase too low'),
    maxPurchase: z.number().min(1000).optional(),
    startDate: z.string().pipe(z.coerce.date()),
    endDate: z.string().pipe(z.coerce.date()),
    bonusPercentage: z.number().min(0).max(100).optional(),
    kycRequired: z.boolean().default(true),
    allowRefunds: z.boolean().default(true),
    refundPeriodDays: z.number().min(0).max(30).default(7)
  }).refine(data => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"]
  }),

  bulkDiscount: z.object({
    minimumAmount: z.number().min(1000),
    discountPercentage: z.number().min(0).max(50),
    description: z.string().optional()
  }),

  vestingSchedule: z.object({
    enabled: z.boolean().default(false),
    cliffPeriodMonths: z.number().min(0).max(24).default(6),
    vestingPeriodMonths: z.number().min(1).max(60).default(24),
    unlockPercentageAtTGE: z.number().min(0).max(100).default(25),
    monthlyUnlockPercentage: z.number().min(0).max(100).default(12.5)
  }),

  presaleStats: z.object({
    dateFrom: z.string().pipe(z.coerce.date()).optional(),
    dateTo: z.string().pipe(z.coerce.date()).optional(),
    groupBy: z.enum(['day', 'week', 'month']).default('day')
  })
};

export interface PresaleRoundSummary {
  round: number;
  name: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  price: number;
  totalTokens: number;
  soldTokens: number;
  remainingTokens: number;
  soldPercentage: number;
  totalRaised: number;
  uniqueBuyers: number;
  startDate: Date;
  endDate: Date;
  daysRemaining: number;
  isActive: boolean;
}

export interface TokenomicsBreakdown {
  presale: { percentage: number; tokens: number; value: number };
  team: { percentage: number; tokens: number; value: number };
  marketing: { percentage: number; tokens: number; value: number };
  ecosystem: { percentage: number; tokens: number; value: number };
  reserve: { percentage: number; tokens: number; value: number };
  totalSupply: number;
  circulatingSupply: number;
}

export interface VestingScheduleEvent {
  date: Date;
  percentage: number;
  tokenAmount: number;
  eventType: 'cliff' | 'monthly' | 'tge';
  isUnlocked: boolean;
}
