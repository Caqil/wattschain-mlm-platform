
import { ObjectId, UserRole } from './index';
import { KYCStatus } from './kyc';

// Authentication Request Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  referralCode?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Authentication Response Types
export interface AuthResponse {
  user: AuthUser;
  tokens: TokenPair;
  isFirstLogin?: boolean;
}

export interface AuthUser {
  id: ObjectId;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMLMEligible: boolean;
  kycStatus: KYCStatus;
  referralCode: string;
  avatar?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: ObjectId;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Session Types
export interface UserSession {
  user: AuthUser;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Form Validation Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  referralCode: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

// Auth Context Types
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}
