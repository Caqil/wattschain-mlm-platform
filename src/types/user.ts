
import { ObjectId, UserRole, FileUpload } from './index';

// User Profile Types
export interface UserProfile {
  id: ObjectId;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  avatar?: string;
  
  // MLM Info
  referralCode: string;
  referredBy?: string;
  isMLMEligible: boolean;
  mlmActivationDate?: Date;
  totalPurchaseAmount: number;
  
  // Status
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  role: UserRole;
  kycStatus: KYCStatus;
  
  // Timestamps
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserStats {
  totalTokenBalance: number;
  totalCommissionsEarned: number;
  totalCommissionsWithdrawn: number;
  pendingCommissions: number;
  directReferrals: number;
  totalDownline: number;
  mlmLevel: number;
  joinDate: Date;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  avatar?: FileUpload;
}

export interface UserListItem {
  id: ObjectId;
  email: string;
  username: string;
  fullName: string;
  isMLMEligible: boolean;
  kycStatus: KYCStatus;
  totalPurchaseAmount: number;
  directReferrals: number;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface UserSearchParams {
  query?: string;
  kycStatus?: KYCStatus;
  isMLMEligible?: boolean;
  role?: UserRole;
  country?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

// KYC Status (used in user context)
export type KYCStatus = 'pending' | 'submitted' | 'approved' | 'rejected' | 'resubmit_required';

// Admin User Management
export interface AdminUserActions {
  banUser: (userId: ObjectId, reason: string) => Promise<void>;
  unbanUser: (userId: ObjectId) => Promise<void>;
  updateKYCStatus: (userId: ObjectId, status: KYCStatus, notes?: string) => Promise<void>;
  impersonateUser: (userId: ObjectId) => Promise<void>;
}
