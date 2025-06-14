import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { User } from '@/models/User';
import { AuthUser, JWTPayload, TokenPair } from '@/types/auth';
import { connectDatabase } from './database';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Password Configuration
const SALT_ROUNDS = 12;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Failed to compare password');
  }
}

/**
 * Generate JWT token pair (access + refresh)
 */
export function generateTokenPair(userId: string, email: string, role: string): TokenPair {
  try {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId,
      email,
      role: role as any
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'wattschain-platform',
      audience: 'wattschain-users'
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'wattschain-platform',
      audience: 'wattschain-users'
    });

    // Calculate expiration time in seconds
    const expiresIn = jwt.decode(accessToken) as any;
    const expirationTime = expiresIn.exp - expiresIn.iat;

    return {
      accessToken,
      refreshToken,
      expiresIn: expirationTime,
      tokenType: 'Bearer'
    };
  } catch (error) {
    throw new Error('Failed to generate tokens');
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, isRefreshToken = false): JWTPayload {
  try {
    const secret = isRefreshToken ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract token from request headers
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Get user from token
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = verifyToken(token);
    await connectDatabase();
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive || user.isBanned) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMLMEligible: user.isMLMEligible,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      avatar: user.avatar
    };
  } catch (error) {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  try {
    const decoded = verifyToken(refreshToken, true);
    await connectDatabase();
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive || user.isBanned) {
      throw new Error('User not found or inactive');
    }

    return generateTokenPair(user._id.toString(), user.email, user.role);
  } catch (error) {
    throw new Error('Failed to refresh token');
  }
}

/**
 * Generate secure random token for email verification, password reset, etc.
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate referral code
 */
export function generateReferralCode(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `WC${timestamp}${random}`.toUpperCase();
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Check if account is locked due to failed login attempts
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    await connectDatabase();
    const user = await User.findById(userId);
    
    if (!user || !user.lockUntil) {
      return false;
    }

    return user.lockUntil > new Date();
  } catch (error) {
    return false;
  }
}

/**
 * Increment login attempts and lock account if necessary
 */
export async function incrementLoginAttempts(userId: string): Promise<void> {
  try {
    await connectDatabase();
    const user = await User.findById(userId);
    
    if (!user) return;

    const maxAttempts = 5;
    const lockDuration = 15 * 60 * 1000; // 15 minutes

    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= maxAttempts) {
      user.lockUntil = new Date(Date.now() + lockDuration);
    }

    await user.save();
  } catch (error) {
    console.error('Failed to increment login attempts:', error);
  }
}

/**
 * Reset login attempts after successful login
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  try {
    await connectDatabase();
    await User.findByIdAndUpdate(userId, {
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      },
      lastLogin: new Date()
    });
  } catch (error) {
    console.error('Failed to reset login attempts:', error);
  }
}

/**
 * Generate email verification token
 */
export function generateEmailVerificationToken(email: string): string {
  const payload = {
    email,
    purpose: 'email_verification',
    timestamp: Date.now()
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify email verification token
 */
export function verifyEmailVerificationToken(token: string): { email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.purpose !== 'email_verification') {
      return null;
    }

    return { email: decoded.email };
  } catch (error) {
    return null;
  }
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    purpose: 'password_reset',
    timestamp: Date.now()
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.purpose !== 'password_reset') {
      return null;
    }

    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    return null;
  }
}

/**
 * Create session data for cookies
 */
export function createSessionData(user: AuthUser, tokens: TokenPair) {
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMLMEligible: user.isMLMEligible,
      kycStatus: user.kycStatus,
      referralCode: user.referralCode,
      avatar: user.avatar
    },
    tokens,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  };
}

/**
 * Middleware helper for protected routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    throw new Error('No token provided');
  }

  const user = await getUserFromToken(token);
  
  if (!user) {
    throw new Error('Invalid or expired token');
  }

  if (await isAccountLocked(user.id)) {
    throw new Error('Account is temporarily locked');
  }

  return user;
}

/**
 * Middleware helper for admin routes
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);
  
  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions = {
    admin: ['*'], // Admin has all permissions
    moderator: ['user_management', 'kyc_review', 'transaction_view', 'support'],
    user: ['profile_edit', 'transaction_create', 'mlm_view']
  };

  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
  
  return permissions.includes('*') || permissions.includes(requiredPermission);
}

/**
 * Log security event
 */
export async function logSecurityEvent(event: {
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'account_locked' | 'suspicious_activity';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}): Promise<void> {
  try {
    // In a real implementation, you would log to a security monitoring system
    console.log('Security Event:', {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // You could also store in database for audit trail
    // await SecurityLog.create(event);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}