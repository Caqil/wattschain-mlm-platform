// src/models/User.ts
import { Schema, model, models, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  referralCode: string;
  referredBy?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  role: 'user' | 'admin' | 'moderator';
  
  // MLM Eligibility
  isMLMEligible: boolean;
  mlmActivationDate?: Date;
  totalPurchaseAmount: number;
  
  // KYC Status
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | 'resubmit_required';
  kycCompletedAt?: Date;
  
  // Security
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  ipAddress?: string;
  deviceFingerprint?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateReferralCode(): string;
  isMLMQualified(): boolean;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  country: {
    type: String,
    required: true,
    default: 'Kenya'
  },
  city: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    unique: true,
    required: true
  },
  referredBy: {
    type: String,
    ref: 'User'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // MLM Fields
  isMLMEligible: {
    type: Boolean,
    default: false
  },
  mlmActivationDate: {
    type: Date
  },
  totalPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // KYC Fields
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected', 'resubmit_required'],
    default: 'pending'
  },
  kycCompletedAt: {
    type: Date
  },
  
  // Security Fields
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  deviceFingerprint: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ referralCode: 1 });
UserSchema.index({ referredBy: 1 });
UserSchema.index({ kycStatus: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate referral code
UserSchema.methods.generateReferralCode = function(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `WC${timestamp}${random}`.toUpperCase();
};

// Method to check MLM qualification
UserSchema.methods.isMLMQualified = function(): boolean {
  return this.totalPurchaseAmount >= 100000 && this.kycStatus === 'approved';
};

export const User = models.User || model<IUser>('User', UserSchema);

