
import { z } from 'zod';
import { ObjectId } from './index';

export const UserZodSchemas = {
  profileUpdate: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
    city: z.string().min(1, 'City is required').optional(),
    country: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    avatar: z.instanceof(File).optional(),
    preferences: z.object({
      language: z.string().optional(),
      timezone: z.string().optional(),
      currency: z.enum(['KES', 'USD']).optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
        push: z.boolean().optional()
      }).optional()
    }).optional()
  }),

  securitySettings: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
    confirmPassword: z.string().optional(),
    enableTwoFactor: z.boolean().optional(),
    twoFactorMethod: z.enum(['sms', 'email']).optional()
  }).refine(data => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      return false;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  adminUserUpdate: z.object({
    isActive: z.boolean().optional(),
    isBanned: z.boolean().optional(),
    role: z.enum(['user', 'admin', 'moderator']).optional(),
    isMLMEligible: z.boolean().optional(),
    kycStatus: z.enum(['pending', 'submitted', 'approved', 'rejected', 'resubmit_required']).optional(),
    notes: z.string().optional()
  }),

  userSearch: z.object({
    query: z.string().optional(),
    role: z.enum(['user', 'admin', 'moderator']).optional(),
    status: z.enum(['active', 'inactive', 'banned']).optional(),
    kycStatus: z.enum(['pending', 'submitted', 'approved', 'rejected']).optional(),
    registrationDateFrom: z.string().pipe(z.coerce.date()).optional(),
    registrationDateTo: z.string().pipe(z.coerce.date()).optional(),
    hasReferrals: z.boolean().optional(),
    isMLMEligible: z.boolean().optional()
  })
};

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
  bio?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  kycStatus: string;
  role: string;
  memberSince: Date;
  lastLogin?: Date;
  referralCode: string;
  isMLMEligible: boolean;
  totalPurchaseAmount: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  kycPendingCount: number;
  kycApprovedCount: number;
  kycRejectedCount: number;
  mlmEligibleCount: number;
  bannedUsersCount: number;
  userGrowthRate: number;
}

export interface UserActivity {
  id: ObjectId;
  userId: ObjectId;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: any;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: 'KES' | 'USD';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showActivity: boolean;
    allowReferralTracking: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    defaultView: 'overview' | 'transactions' | 'mlm';
    showWelcomeTips: boolean;
  };
}
