
import { z } from 'zod';

export const KYCZodSchemas = {
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().pipe(z.coerce.date()),
    nationality: z.string().min(1, 'Nationality is required'),
    idType: z.enum(['national_id', 'passport', 'driving_license']),
    idNumber: z.string().min(1, 'ID number is required')
  }),

  addressInfo: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('Kenya')
  }),

  documents: z.object({
    idFront: z.instanceof(File, { message: 'ID front image is required' }),
    idBack: z.instanceof(File, { message: 'ID back image is required' }).optional(),
    proofOfAddress: z.instanceof(File, { message: 'Proof of address is required' }),
    selfie: z.instanceof(File, { message: 'Selfie is required' })
  }),

  review: z.object({
    status: z.enum(['approved', 'rejected', 'resubmit_required']),
    rejectionReason: z.string().optional(),
    reviewNotes: z.string().optional(),
    verificationScore: z.number().min(0).max(100).optional(),
    riskLevel: z.enum(['low', 'medium', 'high']).optional()
  })
};

export interface KYCStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  validationSchema: z.ZodSchema;
}

export interface ShuftipProResponse {
  reference: string;
  event: string;
  verification_status: string;
  verification_data: {
    document: {
      name: {
        first_name: string;
        last_name: string;
        full_name: string;
      };
      dob: string;
      document_number: string;
      expiry_date: string;
      issue_date: string;
    };
    address: {
      full_address: string;
      name: {
        first_name: string;
        last_name: string;
      };
    };
    verification_result: {
      name: string;
      dob: string;
      document_number: string;
      expiry_date: string;
      issue_date: string;
    };
  };
  declined_reason?: string;
  verification_result: {
    document: number;
    address: number;
    face: number;
  };
}
