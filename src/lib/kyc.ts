import crypto from 'crypto';
import axios from 'axios';
import { KYC } from '@/models/KYC';
import { User } from '@/models/User';
import { KYCProfile, KYCSubmissionRequest, KYCReviewRequest, ShuftipProConfig, ShuftipProRequest, ShuftipProResponse, KYCStatus, RiskLevel } from '@/types/kyc';
import { connectDatabase } from './database';
import { sendKYCApproved, sendKYCRejected } from './email';
import { KYC_CONFIG } from './constants';

// Shuftipro configuration
const SHUFTIPRO_CONFIG: ShuftipProConfig = {
  clientId: process.env.SHUFTIPRO_CLIENT_ID || '',
  secretKey: process.env.SHUFTIPRO_SECRET_KEY || '',
  baseUrl: process.env.SHUFTIPRO_BASE_URL || 'https://api.shuftipro.com/',
  webhookSecret: process.env.SHUFTIPRO_WEBHOOK_SECRET || ''
};

// Document type mapping
const DOCUMENT_TYPE_MAPPING = {
  'national_id': 'id_card',
  'passport': 'passport',
  'driving_license': 'driving_license'
};

/**
 * Submit KYC documents for verification
 */
export async function submitKYC(
  userId: string,
  kycData: KYCSubmissionRequest
): Promise<{
  success: boolean;
  kycId?: string;
  verificationUrl?: string;
  error?: string;
}> {
  try {
    await connectDatabase();

    // Check if user exists and is not banned
    const user = await User.findById(userId);
    if (!user || user.isBanned) {
      throw new Error('User not found or banned');
    }

    // Check if KYC already exists
    let kyc = await KYC.findOne({ userId });
    
    if (kyc && kyc.status === 'approved') {
      throw new Error('KYC already approved');
    }

    if (kyc && kyc.resubmissionCount >= KYC_CONFIG.MAX_RESUBMISSIONS) {
      throw new Error('Maximum resubmission attempts exceeded');
    }

    // Validate document types
    const requiredDocs = KYC_CONFIG.REQUIRED_DOCUMENTS;
    for (const docType of requiredDocs) {
      if (!kycData.documents[docType as keyof typeof kycData.documents]) {
        throw new Error(`Missing required document: ${docType}`);
      }
    }

    // Process and validate documents
    const processedDocuments = await processDocuments(kycData.documents);

    // Create or update KYC record
    if (kyc) {
      kyc.resubmissionCount += 1;
      kyc.status = 'submitted';
      kyc.submittedAt = new Date();
    } else {
      kyc = new KYC({
        userId,
        resubmissionCount: 0,
        maxResubmissions: KYC_CONFIG.MAX_RESUBMISSIONS
      });
    }

    // Update KYC data
    Object.assign(kyc, {
      firstName: kycData.firstName,
      lastName: kycData.lastName,
      dateOfBirth: new Date(kycData.dateOfBirth),
      nationality: kycData.nationality,
      idNumber: kycData.idNumber,
      idType: kycData.idType,
      address: kycData.address,
      city: kycData.city,
      state: kycData.state,
      postalCode: kycData.postalCode,
      country: kycData.country,
      documents: processedDocuments,
      status: 'submitted',
      submittedAt: new Date()
    });

    await kyc.save();

    // Submit to Shuftipro for verification
    const shuftipResult = await submitToShuftipro(kyc);
    
    if (shuftipResult.success && shuftipResult.verificationUrl) {
      kyc.shuftipro = {
        reference: shuftipResult.reference,
        verificationUrl: shuftipResult.verificationUrl,
        status: 'pending'
      };
      
      kyc.status = 'under_review';
      await kyc.save();
    }

    console.log(`✅ KYC submitted for user ${userId}`);

    return {
      success: true,
      kycId: kyc._id.toString(),
      verificationUrl: shuftipResult.verificationUrl
    };

  } catch (error) {
    console.error('❌ KYC submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'KYC submission failed'
    };
  }
}

/**
 * Process and validate uploaded documents
 */
async function processDocuments(documents: any): Promise<any> {
  const processed: any = {};

  for (const [type, file] of Object.entries(documents)) {
    if (!file) continue;

    // Validate file type
    if (!KYC_CONFIG.ALLOWED_FILE_TYPES.includes((file as any).type)) {
      throw new Error(`Invalid file type for ${type}`);
    }

    // Validate file size
    if ((file as any).size > KYC_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large for ${type}`);
    }

    // In a real implementation, you would:
    // 1. Upload to secure storage (AWS S3, etc.)
    // 2. Generate secure URLs
    // 3. Run virus scanning
    // 4. Extract metadata
    // 5. Apply image processing/optimization

    processed[type] = {
      url: `https://secure-storage.wattschain.com/kyc/${Date.now()}-${type}`,
      filename: (file as any).name,
      size: (file as any).size,
      uploadedAt: new Date()
    };
  }

  return processed;
}

/**
 * Submit KYC to Shuftipro for verification
 */
async function submitToShuftipro(kyc: any): Promise<{
  success: boolean;
  reference?: string;
  verificationUrl?: string;
  error?: string;
}> {
  try {
    if (!SHUFTIPRO_CONFIG.clientId || !SHUFTIPRO_CONFIG.secretKey) {
      throw new Error('Shuftipro configuration missing');
    }

    const reference = generateShuftipReference();
    
    const requestData: ShuftipProRequest = {
      reference,
      country: kyc.country.toLowerCase(),
      language: 'en',
      email: '', // Will be populated from user data
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/kyc/shuftipro`,
      face: true,
      document: {
        supported_types: [DOCUMENT_TYPE_MAPPING[kyc.idType as keyof typeof DOCUMENT_TYPE_MAPPING]],
        name: {
          first_name: kyc.firstName,
          last_name: kyc.lastName
        },
        dob: kyc.dateOfBirth.toISOString().split('T')[0],
        document_number: kyc.idNumber
      },
      address: {
        supported_types: ['utility_bill', 'bank_statement'],
        full_address: `${kyc.address}, ${kyc.city}, ${kyc.state}, ${kyc.postalCode}`
      }
    };

    // Generate authentication token
    const token = generateShuftipToken(requestData);

    const response = await axios.post(
      `${SHUFTIPRO_CONFIG.baseUrl}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${token}`
        },
        timeout: 30000
      }
    );

    if (response.data.event === 'request.pending') {
      return {
        success: true,
        reference,
        verificationUrl: response.data.verification_url
      };
    } else {
      throw new Error(response.data.error || 'Shuftipro verification failed');
    }

  } catch (error) {
    console.error('❌ Shuftipro submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Shuftipro submission failed'
    };
  }
}

/**
 * Generate Shuftipro reference ID
 */
function generateShuftipReference(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `WC-${timestamp}-${random}`;
}

/**
 * Generate Shuftipro authentication token
 */
function generateShuftipToken(requestData: any): string {
  const clientId = SHUFTIPRO_CONFIG.clientId;
  const secretKey = SHUFTIPRO_CONFIG.secretKey;
  
  return Buffer.from(`${clientId}:${secretKey}`).toString('base64');
}

/**
 * Handle Shuftipro webhook callback
 */
export async function handleShuftipWebhook(
  payload: any,
  signature: string
): Promise<{
  success: boolean;
  processed: boolean;
  error?: string;
}> {
  try {
    // Verify webhook signature
    if (!verifyShuftipSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const webhookData = payload as ShuftipProResponse;
    
    await connectDatabase();

    // Find KYC record by Shuftipro reference
    const kyc = await KYC.findOne({
      'shuftipro.reference': webhookData.reference
    });

    if (!kyc) {
      console.log(`⚠️ KYC record not found for reference: ${webhookData.reference}`);
      return { success: true, processed: false };
    }

    // Update KYC with webhook data
    kyc.shuftipro.response = webhookData;
    kyc.shuftipro.webhookData = payload;
    kyc.shuftipro.status = webhookData.event;

    // Process verification result
    if (webhookData.event === 'verification.accepted') {
      await processVerificationAccepted(kyc, webhookData);
    } else if (webhookData.event === 'verification.declined') {
      await processVerificationDeclined(kyc, webhookData);
    } else if (webhookData.event === 'request.unauthorized') {
      await processVerificationError(kyc, 'Unauthorized verification request');
    }

    await kyc.save();

    console.log(`✅ Processed Shuftipro webhook for reference: ${webhookData.reference}`);

    return { success: true, processed: true };

  } catch (error) {
    console.error('❌ Shuftipro webhook processing failed:', error);
    return {
      success: false,
      processed: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed'
    };
  }
}

/**
 * Verify Shuftipro webhook signature
 */
function verifyShuftipSignature(payload: any, signature: string): boolean {
  try {
    const secret = SHUFTIPRO_CONFIG.webhookSecret;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Process accepted verification
 */
async function processVerificationAccepted(kyc: any, webhookData: ShuftipProResponse): Promise<void> {
  // Calculate verification score based on Shuftipro results
  const score = calculateVerificationScore(webhookData);
  const riskLevel = calculateRiskLevel(score);

  kyc.verificationScore = score;
  kyc.riskLevel = riskLevel;
  kyc.reviewedAt = new Date();

  // Auto-approve if score is high enough
  if (score >= KYC_CONFIG.AUTO_APPROVAL_THRESHOLD) {
    kyc.status = 'approved';
    kyc.approvedAt = new Date();

    // Update user KYC status
    await User.findByIdAndUpdate(kyc.userId, {
      kycStatus: 'approved',
      kycCompletedAt: new Date()
    });

    // Send approval email
    const user = await User.findById(kyc.userId);
    if (user) {
      await sendKYCApproved({
        email: user.email,
        firstName: user.firstName,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      });
    }

    console.log(`✅ Auto-approved KYC for user ${kyc.userId} with score ${score}`);
  } else if (score >= KYC_CONFIG.MANUAL_REVIEW_THRESHOLD) {
    kyc.status = 'under_review';
    console.log(`⏳ KYC requires manual review for user ${kyc.userId} with score ${score}`);
  } else {
    await processVerificationDeclined(kyc, webhookData);
  }
}

/**
 * Process declined verification
 */
async function processVerificationDeclined(kyc: any, webhookData: ShuftipProResponse): Promise<void> {
  kyc.status = 'rejected';
  kyc.rejectedAt = new Date();
  kyc.rejectionReason = extractRejectionReason(webhookData);

  // Update user KYC status
  await User.findByIdAndUpdate(kyc.userId, {
    kycStatus: 'rejected'
  });

  // Send rejection email
  const user = await User.findById(kyc.userId);
  if (user) {
    await sendKYCRejected({
      email: user.email,
      firstName: user.firstName,
      rejectionReason: kyc.rejectionReason,
      resubmitLink: `${process.env.NEXT_PUBLIC_APP_URL}/kyc/verification`
    });
  }

  console.log(`❌ Rejected KYC for user ${kyc.userId}: ${kyc.rejectionReason}`);
}

/**
 * Process verification error
 */
async function processVerificationError(kyc: any, errorMessage: string): Promise<void> {
  kyc.status = 'resubmit_required';
  kyc.rejectionReason = errorMessage;

  console.log(`⚠️ KYC error for user ${kyc.userId}: ${errorMessage}`);
}

/**
 * Calculate verification score based on Shuftipro results
 */
function calculateVerificationScore(webhookData: ShuftipProResponse): number {
  let score = 0;
  const results = webhookData.verification_result;

  if (!results) return 0;

  // Document verification (40 points)
  if (results.document?.verification_result === 'accepted') {
    score += 40;
  } else if (results.document?.verification_result === 'pending') {
    score += 20;
  }

  // Face verification (35 points)
  if (results.face?.verification_result === 'accepted') {
    score += 35;
  } else if (results.face?.verification_result === 'pending') {
    score += 15;
  }

  // Address verification (25 points)
  if (results.address?.verification_result === 'accepted') {
    score += 25;
  } else if (results.address?.verification_result === 'pending') {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calculate risk level based on score
 */
function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
}

/**
 * Extract rejection reason from Shuftipro response
 */
function extractRejectionReason(webhookData: ShuftipProResponse): string {
  const results = webhookData.verification_result;
  const reasons: string[] = [];

  if (results?.document?.verification_result === 'declined') {
    reasons.push('Document verification failed - please ensure document is clear and valid');
  }

  if (results?.face?.verification_result === 'declined') {
    reasons.push('Face verification failed - please ensure selfie clearly shows your face');
  }

  if (results?.address?.verification_result === 'declined') {
    reasons.push('Address verification failed - please provide a valid proof of address');
  }

  return reasons.length > 0 ? reasons.join('; ') : 'Verification failed - please check all documents and try again';
}

/**
 * Manual KYC review (admin function)
 */
export async function reviewKYC(
  kycId: string,
  reviewData: KYCReviewRequest,
  reviewerId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await connectDatabase();

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      throw new Error('KYC record not found');
    }

    // Update KYC record
    kyc.status = reviewData.status;
    kyc.reviewedBy = reviewerId;
    kyc.reviewedAt = new Date();
    kyc.reviewNotes = reviewData.reviewNotes;
    kyc.verificationScore = reviewData.verificationScore;
    kyc.riskLevel = reviewData.riskLevel;

    if (reviewData.status === 'approved') {
      kyc.approvedAt = new Date();
      
      // Update user status
      await User.findByIdAndUpdate(kyc.userId, {
        kycStatus: 'approved',
        kycCompletedAt: new Date()
      });

      // Send approval email
      const user = await User.findById(kyc.userId);
      if (user) {
        await sendKYCApproved({
          email: user.email,
          firstName: user.firstName,
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        });
      }
    } else if (reviewData.status === 'rejected') {
      kyc.rejectedAt = new Date();
      kyc.rejectionReason = reviewData.rejectionReason;
      
      // Update user status
      await User.findByIdAndUpdate(kyc.userId, {
        kycStatus: 'rejected'
      });

      // Send rejection email
      const user = await User.findById(kyc.userId);
      if (user) {
        await sendKYCRejected({
          email: user.email,
          firstName: user.firstName,
          rejectionReason: kyc.rejectionReason || 'KYC verification was rejected',
          resubmitLink: `${process.env.NEXT_PUBLIC_APP_URL}/kyc/verification`
        });
      }
    }

    await kyc.save();

    console.log(`✅ KYC review completed for ${kycId} by ${reviewerId}`);

    return { success: true };

  } catch (error) {
    console.error('❌ KYC review failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'KYC review failed'
    };
  }
}

/**
 * Get KYC status for user
 */
export async function getKYCStatus(userId: string): Promise<{
  status: KYCStatus;
  kyc?: KYCProfile;
  canResubmit: boolean;
  error?: string;
}> {
  try {
    await connectDatabase();

    const kyc = await KYC.findOne({ userId }).lean();
    const user = await User.findById(userId).select('kycStatus').lean();

    if (!user) {
      throw new Error('User not found');
    }

    if (!kyc) {
      return {
        status: 'pending',
        canResubmit: true
      };
    }

    const canResubmit = kyc.resubmissionCount < kyc.maxResubmissions && 
                       ['rejected', 'resubmit_required'].includes(kyc.status);

    return {
      status: kyc.status,
      kyc: {
        id: kyc.id.toString(),
        userId: kyc.userId,
        firstName: kyc.firstName,
        lastName: kyc.lastName,
        dateOfBirth: kyc.dateOfBirth,
        nationality: kyc.nationality,
        idNumber: kyc.idNumber,
        idType: kyc.idType,
        address: kyc.address,
        city: kyc.city,
        state: kyc.state,
        postalCode: kyc.postalCode,
        country: kyc.country,
        documents: kyc.documents,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
        reviewedAt: kyc.reviewedAt,
        approvedAt: kyc.approvedAt,
        rejectedAt: kyc.rejectedAt,
        reviewedBy: kyc.reviewedBy,
        rejectionReason: kyc.rejectionReason,
        reviewNotes: kyc.reviewNotes,
        verificationScore: kyc.verificationScore,
        riskLevel: kyc.riskLevel,
        resubmissionCount: kyc.resubmissionCount,
        maxResubmissions: kyc.maxResubmissions,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt
      },
      canResubmit
    };

  } catch (error) {
    console.error('❌ Failed to get KYC status:', error);
    return {
      status: 'pending',
      canResubmit: false,
      error: error instanceof Error ? error.message : 'Failed to get KYC status'
    };
  }
}

/**
 * Get pending KYC reviews (admin function)
 */
export async function getPendingKYCReviews(
  page: number = 1,
  limit: number = 20
): Promise<{
  kycs: any[];
  pagination: any;
  error?: string;
}> {
  try {
    await connectDatabase();

    const skip = (page - 1) * limit;

    const [kycs, total] = await Promise.all([
      KYC.find({ 
        status: { $in: ['submitted', 'under_review'] }
      })
        .populate('userId', 'firstName lastName email username')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      
      KYC.countDocuments({ 
        status: { $in: ['submitted', 'under_review'] }
      })
    ]);

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    return { kycs, pagination };

  } catch (error) {
    console.error('❌ Failed to get pending KYC reviews:', error);
    return {
      kycs: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      error: error instanceof Error ? error.message : 'Failed to get pending reviews'
    };
  }
}

/**
 * Generate KYC analytics
 */
export async function getKYCAnalytics(): Promise<{
  totalSubmissions: number;
  pendingReviews: number;
  approvedKYCs: number;
  rejectedKYCs: number;
  approvalRate: number;
  averageReviewTime: number;
  resubmissionRate: number;
  riskDistribution: Record<RiskLevel, number>;
}> {
  try {
    await connectDatabase();

    const [
      totalSubmissions,
      pendingReviews,
      approvedKYCs,
      rejectedKYCs,
      resubmissions,
      riskDistribution
    ] = await Promise.all([
      KYC.countDocuments(),
      KYC.countDocuments({ status: { $in: ['submitted', 'under_review'] } }),
      KYC.countDocuments({ status: 'approved' }),
      KYC.countDocuments({ status: 'rejected' }),
      KYC.countDocuments({ resubmissionCount: { $gt: 0 } }),
      KYC.aggregate([
        { $match: { riskLevel: { $exists: true } } },
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ])
    ]);

    // Calculate average review time
    const reviewedKYCs = await KYC.find({
      status: { $in: ['approved', 'rejected'] },
      submittedAt: { $exists: true },
      reviewedAt: { $exists: true }
    }).select('submittedAt reviewedAt').lean();

    const averageReviewTime = reviewedKYCs.length > 0
      ? reviewedKYCs.reduce((sum, kyc) => {
          const reviewTime = new Date(kyc.reviewedAt!).getTime() - new Date(kyc.submittedAt!).getTime();
          return sum + reviewTime;
        }, 0) / reviewedKYCs.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const approvalRate = totalSubmissions > 0 ? (approvedKYCs / totalSubmissions) * 100 : 0;
    const resubmissionRate = totalSubmissions > 0 ? (resubmissions / totalSubmissions) * 100 : 0;

    const riskDistrib: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0
    };

    riskDistribution.forEach((item: any) => {
      riskDistrib[item._id as RiskLevel] = item.count;
    });

    return {
      totalSubmissions,
      pendingReviews,
      approvedKYCs,
      rejectedKYCs,
      approvalRate,
      averageReviewTime,
      resubmissionRate,
      riskDistribution: riskDistrib
    };

  } catch (error) {
    console.error('❌ Failed to generate KYC analytics:', error);
    throw error;
  }
}

/**
 * Cleanup expired KYC sessions
 */
export async function cleanupExpiredKYCSessions(): Promise<number> {
  try {
    await connectDatabase();

    const expirationDate = new Date(Date.now() - KYC_CONFIG.VERIFICATION_TIMEOUT);

    const result = await KYC.deleteMany({
      status: 'pending',
      createdAt: { $lt: expirationDate }
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired KYC sessions`);
    return result.deletedCount || 0;

  } catch (error) {
    console.error('❌ Failed to cleanup expired KYC sessions:', error);
    return 0;
  }
}
