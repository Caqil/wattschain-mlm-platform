
import { z } from 'zod';
import { ObjectId } from './index';
export const AuthZodSchemas = {
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
  }),

  register: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string().min(3, 'Username must be at least 3 characters').max(30),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
    country: z.string().default('Kenya'),
    city: z.string().min(1, 'City is required'),
    referralCode: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms')
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email format')
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  verifyEmail: z.object({
    token: z.string().min(1, 'Verification token is required')
  }),

  verifyPhone: z.object({
    code: z.string().length(6, 'Verification code must be 6 digits')
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string()
  }).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"]
  }),

  setupTwoFactor: z.object({
    method: z.enum(['sms', 'email']),
    phoneNumber: z.string().optional(),
    email: z.string().email().optional()
  }),

  verifyTwoFactor: z.object({
    code: z.string().length(6, 'Verification code must be 6 digits')
  })
};

export interface SessionData {
  userId: ObjectId;
  email: string;
  username: string;
  role: string;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  lastActivity: Date;
  deviceId: string;
  ipAddress: string;
}

export interface RefreshTokenData {
  userId: ObjectId;
  tokenId: string;
  deviceId: string;
  expiresAt: Date;
  isActive: boolean;
}

