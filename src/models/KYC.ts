import { Schema, model, models, Document } from 'mongoose';

export interface IKYC extends Document {
  _id: string;
  userId: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  idNumber: string;
  idType: 'national_id' | 'passport' | 'driving_license';
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Document Uploads
  documents: {
    idFront?: string; // File URL
    idBack?: string; // File URL
    proofOfAddress?: string; // File URL
    selfie?: string; // File URL
  };
  
  // Shuftipro Integration
  shuftipro: {
    reference?: string;
    status?: string;
    response?: any;
    webhookData?: any;
    verificationUrl?: string;
  };
  
  // Verification Status
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resubmit_required';
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  
  // Review Details
  reviewedBy?: string; // Admin user ID
  rejectionReason?: string;
  reviewNotes?: string;
  
  // Verification Scores
  verificationScore?: number; // 0-100
  riskLevel?: 'low' | 'medium' | 'high';
  
  // Resubmission
  resubmissionCount: number;
  maxResubmissions: number;
  
  // Metadata
  metadata?: any;
  
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema = new Schema<IKYC>({
  userId: {
    type: String,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  idType: {
    type: String,
    enum: ['national_id', 'passport', 'driving_license'],
    required: true
  },
  
  // Address Information
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'Kenya'
  },
  
  // Document Uploads
  documents: {
    idFront: String,
    idBack: String,
    proofOfAddress: String,
    selfie: String
  },
  
  // Shuftipro Integration
  shuftipro: {
    reference: String,
    status: String,
    response: Schema.Types.Mixed,
    webhookData: Schema.Types.Mixed,
    verificationUrl: String
  },
  
  // Verification Status
  status: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'approved', 'rejected', 'resubmit_required'],
    default: 'pending'
  },
  submittedAt: {
    type: Date
  },
  reviewedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  
  // Review Details
  reviewedBy: {
    type: String,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  reviewNotes: {
    type: String
  },
  
  // Verification Scores
  verificationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  
  // Resubmission
  resubmissionCount: {
    type: Number,
    default: 0
  },
  maxResubmissions: {
    type: Number,
    default: 3
  },
  
  // Metadata
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
KYCSchema.index({ userId: 1 });
KYCSchema.index({ status: 1 });
KYCSchema.index({ idNumber: 1 });
KYCSchema.index({ 'shuftipro.reference': 1 });

export const KYC = models.KYC || model<IKYC>('KYC', KYCSchema);
