
import { ObjectId, FileUpload } from './index';

// KYC Types
export type KYCDocumentType = 'national_id' | 'passport' | 'driving_license';
export type KYCStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'resubmit_required';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface KYCProfile {
  id: ObjectId;
  userId: ObjectId;
  
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  idNumber: string;
  idType: KYCDocumentType;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Document Uploads
  documents: {
    idFront?: FileUpload;
    idBack?: FileUpload;
    proofOfAddress?: FileUpload;
    selfie?: FileUpload;
  };
  
  // Status
  status: KYCStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  
  // Review Details
  reviewedBy?: ObjectId;
  rejectionReason?: string;
  reviewNotes?: string;
  verificationScore?: number;
  riskLevel?: RiskLevel;
  
  // Resubmission
  resubmissionCount: number;
  maxResubmissions: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCSubmissionRequest {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  idNumber: string;
  idType: KYCDocumentType;
  
  // Address Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Document Files
  documents: {
    idFront: File;
    idBack?: File;
    proofOfAddress: File;
    selfie: File;
  };
}

export interface KYCReviewRequest {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
  reviewNotes?: string;
  verificationScore?: number;
  riskLevel?: RiskLevel;
}

export interface KYCDocumentUpload {
  type: keyof KYCProfile['documents'];
  file: File;
  progress: number;
  error?: string;
}

// Shuftipro Integration Types
export interface ShuftipProConfig {
  clientId: string;
  secretKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export interface ShuftipProRequest {
  reference: string;
  country: string;
  language: string;
  email: string;
  callback_url: string;
  face: boolean;
  document: {
    supported_types: string[];
    name: {
      first_name: string;
      last_name: string;
    };
    dob: string;
    document_number: string;
    issue_date?: string;
    expiry_date?: string;
  };
  address?: {
    supported_types: string[];
    full_address: string;
  };
}

export interface ShuftipProResponse {
  reference: string;
  event: string;
  error?: any;
  verification_url?: string;
  verification_result?: {
    document?: {
      verification_result: string;
      verification_details: any;
    };
    face?: {
      verification_result: string;
      verification_details: any;
    };
    address?: {
      verification_result: string;
      verification_details: any;
    };
  };
}

export interface KYCDashboardStats {
  totalSubmissions: number;
  pendingReviews: number;
  approvedKYCs: number;
  rejectedKYCs: number;
  approvalRate: number;
  averageReviewTime: number;
  resubmissionRate: number;
}

export interface KYCListItem {
  id: ObjectId;
  userId: ObjectId;
  user: {
    fullName: string;
    email: string;
    username: string;
  };
  status: KYCStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  verificationScore?: number;
  riskLevel?: RiskLevel;
  resubmissionCount: number;
}
