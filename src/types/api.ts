
import { z } from 'zod';
import { AuthZodSchemas, KYCZodSchemas, MLMZodSchemas, PaymentZodSchemas, PresaleZodSchemas, TransactionZodSchemas, UserZodSchemas } from '.';

export const ApiZodSchemas = {
  paginationQuery: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  searchQuery: z.object({
    query: z.string().min(1, 'Search query required'),
    filters: z.record(z.any()).optional(),
    exact: z.boolean().default(false)
  }),

  dateRangeQuery: z.object({
    startDate: z.string().pipe(z.coerce.date()),
    endDate: z.string().pipe(z.coerce.date())
  }).refine(data => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"]
  }),

  bulkAction: z.object({
    action: z.string().min(1, 'Action required'),
    ids: z.array(z.string()).min(1, 'At least one ID required'),
    options: z.record(z.any()).optional()
  })
};

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  path: string;
  method: string;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  peakResponseTime: number;
  errorRate: number;
  mostUsedEndpoints: Array<{
    endpoint: string;
    count: number;
    averageResponseTime: number;
  }>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// Export type inference helpers
export type AuthLoginInput = z.infer<typeof AuthZodSchemas.login>;
export type AuthRegisterInput = z.infer<typeof AuthZodSchemas.register>;
export type KYCPersonalInfoInput = z.infer<typeof KYCZodSchemas.personalInfo>;
export type KYCAddressInfoInput = z.infer<typeof KYCZodSchemas.addressInfo>;
export type PaymentTokenPurchaseInput = z.infer<typeof PaymentZodSchemas.tokenPurchase>;
export type MLMWithdrawalRequestInput = z.infer<typeof MLMZodSchemas.withdrawalRequest>;
export type PresaleRoundConfigInput = z.infer<typeof PresaleZodSchemas.roundConfig>;
export type TransactionFilterInput = z.infer<typeof TransactionZodSchemas.transactionFilter>;
export type UserProfileUpdateInput = z.infer<typeof UserZodSchemas.profileUpdate>;
export type ApiPaginationQuery = z.infer<typeof ApiZodSchemas.paginationQuery>;