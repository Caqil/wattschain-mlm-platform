
export type ObjectId = string;

// Common API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: PaginationInfo;
  timestamp: string;
}

// Pagination
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Common Status Types
export type StatusType = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Common Currency Types
export type CurrencyType = 'KES' | 'USD' | 'BTC' | 'ETH' | 'USDT';

// Common Role Types
export type UserRole = 'user' | 'admin' | 'moderator';

// Common Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Date Range Filter
export interface DateRange {
  startDate?: string | Date;
  endDate?: string | Date;
}

// Search and Filter
export interface SearchFilter {
  query?: string;
  filters?: Record<string, any>;
  dateRange?: DateRange;
}

// File Upload
export interface FileUpload {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

// MLM Constants
export const MLM_LEVELS = [1, 2, 3, 4, 5] as const;
export const MLM_COMMISSION_RATES = {
  1: 10, // 10%
  2: 5,  // 5%
  3: 3,  // 3%
  4: 2,  // 2%
  5: 1   // 1%
} as const;

export const MLM_MIN_PURCHASE_AMOUNT = 100000; // 100,000 KES
export const COMMISSION_LOCK_PERIOD_MONTHS = 12;

