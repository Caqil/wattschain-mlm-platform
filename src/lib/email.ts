import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, ENVIRONMENT } from './constants';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email data interface
interface EmailData {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Rate limiting for email sending
const emailRateLimit = new Map<string, number[]>();

/**
 * Get email configuration based on environment
 */
function getEmailConfig(): EmailConfig {
  if (ENVIRONMENT.IS_PRODUCTION) {
    return {
      host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'apikey',
        pass: process.env.SMTP_PASS || ''
      }
    };
  } else {
    return {
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };
  }
}

/**
 * Create nodemailer transporter
 */
function createTransporter() {
  const config = getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14, // max 14 messages/second
  });
}

// Global transporter instance
let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create email transporter
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Check email rate limit
 */
function checkRateLimit(email: string, templateType: string): boolean {
  const key = `${email}-${templateType}`;
  const now = Date.now();
  const window = EMAIL_CONFIG.RATE_LIMITS.VERIFICATION_EMAIL.WINDOW;
  const maxSends = EMAIL_CONFIG.RATE_LIMITS.VERIFICATION_EMAIL.MAX_SENDS;

  if (!emailRateLimit.has(key)) {
    emailRateLimit.set(key, []);
  }

  const timestamps = emailRateLimit.get(key)!;
  
  // Remove old timestamps outside the window
  const validTimestamps = timestamps.filter(timestamp => now - timestamp < window);
  
  if (validTimestamps.length >= maxSends) {
    return false; // Rate limit exceeded
  }

  // Add current timestamp
  validTimestamps.push(now);
  emailRateLimit.set(key, validTimestamps);
  
  return true;
}

/**
 * Generate HTML email templates
 */
function generateEmailTemplate(template: string, data: Record<string, any>): { html: string; text: string } {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
      .content { background: #f9fafb; padding: 30px; }
      .footer { background: #374151; color: white; padding: 20px; text-align: center; font-size: 12px; }
      .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
      .alert { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; border-radius: 6px; margin: 10px 0; }
      .success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 12px; border-radius: 6px; margin: 10px 0; }
    </style>
  `;

  switch (template) {
    case EMAIL_CONFIG.TEMPLATES.WELCOME:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to WattsChain! 🎉</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>Welcome to the WattsChain platform. We're excited to have you join our community!</p>
                <p>Your account has been successfully created with the email: <strong>${data.email}</strong></p>
                <p>Your unique referral code is: <strong>${data.referralCode}</strong></p>
                
                <h3>Next Steps:</h3>
                <ol>
                  <li>Verify your email address</li>
                  <li>Complete your KYC verification</li>
                  <li>Start purchasing tokens and building your network</li>
                </ol>
                
                <a href="${data.verificationLink}" class="button">Verify Email Address</a>
                
                <p>If you have any questions, don't hesitate to reach out to our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
                <p>If you didn't create this account, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Welcome to WattsChain!\n\nHello ${data.firstName}!\n\nWelcome to the WattsChain platform. Your account has been created with email: ${data.email}\n\nYour referral code: ${data.referralCode}\n\nPlease verify your email: ${data.verificationLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.EMAIL_VERIFICATION:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email Address 📧</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                
                <a href="${data.verificationLink}" class="button">Verify Email Address</a>
                
                <p>This link will expire in 24 hours for security reasons.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
                
                <p><small>Verification code: ${data.verificationCode}</small></p>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Verify Your Email Address\n\nHello ${data.firstName}!\n\nPlease verify your email: ${data.verificationLink}\n\nVerification code: ${data.verificationCode}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.PASSWORD_RESET:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Your Password 🔐</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                
                <a href="${data.resetLink}" class="button">Reset Password</a>
                
                <p>This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
                
                <div class="alert">
                  <strong>Security Notice:</strong> If you didn't request this reset, someone may be trying to access your account. Consider changing your password and enabling two-factor authentication.
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Reset Your Password\n\nHello ${data.firstName}!\n\nReset your password: ${data.resetLink}\n\nThis link expires in 1 hour.\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.KYC_APPROVED:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>KYC Verification Approved! ✅</h1>
              </div>
              <div class="content">
                <h2>Congratulations ${data.firstName}!</h2>
                
                <div class="success">
                  Your KYC verification has been approved! You now have full access to all platform features.
                </div>
                
                <h3>What's Available Now:</h3>
                <ul>
                  <li>✅ Purchase tokens without limits</li>
                  <li>✅ Earn MLM commissions</li>
                  <li>✅ Withdraw earnings</li>
                  <li>✅ Access premium features</li>
                </ul>
                
                <a href="${data.dashboardLink}" class="button">Access Dashboard</a>
                
                <p>Thank you for completing the verification process!</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `KYC Verification Approved!\n\nCongratulations ${data.firstName}!\n\nYour KYC verification has been approved. You now have full access to all platform features.\n\nAccess Dashboard: ${data.dashboardLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.KYC_REJECTED:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>KYC Verification Update ⚠️</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName},</h2>
                
                <div class="alert">
                  We were unable to approve your KYC verification at this time.
                </div>
                
                <h3>Reason:</h3>
                <p>${data.rejectionReason}</p>
                
                <h3>Next Steps:</h3>
                <p>You can resubmit your KYC documents with the required corrections. Please ensure:</p>
                <ul>
                  <li>Documents are clear and readable</li>
                  <li>All information matches exactly</li>
                  <li>Documents are valid and not expired</li>
                  <li>Selfie clearly shows your face</li>
                </ul>
                
                <a href="${data.resubmitLink}" class="button">Resubmit Documents</a>
                
                <p>If you have questions, please contact our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `KYC Verification Update\n\nHello ${data.firstName},\n\nWe were unable to approve your KYC verification.\n\nReason: ${data.rejectionReason}\n\nResubmit: ${data.resubmitLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.COMMISSION_EARNED:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Commission Earned! 💰</h1>
              </div>
              <div class="content">
                <h2>Great news ${data.firstName}!</h2>
                
                <div class="success">
                  You've earned a new commission of <strong>${data.amount} ${data.currency}</strong>!
                </div>
                
                <h3>Commission Details:</h3>
                <ul>
                  <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                  <li><strong>Level:</strong> ${data.level}</li>
                  <li><strong>From:</strong> ${data.fromUser}</li>
                  <li><strong>Date:</strong> ${new Date(data.earnedAt).toLocaleDateString()}</li>
                  <li><strong>Unlock Date:</strong> ${new Date(data.unlocksAt).toLocaleDateString()}</li>
                </ul>
                
                <p>This commission will be locked for 12 months as per our compliance requirements.</p>
                
                <a href="${data.dashboardLink}" class="button">View Dashboard</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Commission Earned!\n\nGreat news ${data.firstName}!\n\nYou've earned ${data.amount} ${data.currency} commission from ${data.fromUser}.\n\nUnlocks: ${new Date(data.unlocksAt).toLocaleDateString()}\n\nView Dashboard: ${data.dashboardLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.COMMISSION_UNLOCKED:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Commission Unlocked! 🔓</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                
                <div class="success">
                  Your commission of <strong>${data.amount} ${data.currency}</strong> has been unlocked and is now available for withdrawal!
                </div>
                
                <h3>Unlocked Commission Details:</h3>
                <ul>
                  <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                  <li><strong>Original Earn Date:</strong> ${new Date(data.originalEarnDate).toLocaleDateString()}</li>
                  <li><strong>Lock Period:</strong> 12 months (completed)</li>
                </ul>
                
                <a href="${data.withdrawalLink}" class="button">Withdraw Now</a>
                
                <p>You can now withdraw this amount to your preferred payment method.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Commission Unlocked!\n\nHello ${data.firstName}!\n\nYour commission of ${data.amount} ${data.currency} is now available for withdrawal.\n\nWithdraw: ${data.withdrawalLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.WITHDRAWAL_CONFIRMED:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Withdrawal Confirmed! ✅</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                
                <div class="success">
                  Your withdrawal has been processed successfully!
                </div>
                
                <h3>Withdrawal Details:</h3>
                <ul>
                  <li><strong>Amount:</strong> ${data.amount} ${data.currency}</li>
                  <li><strong>Method:</strong> ${data.withdrawalMethod}</li>
                  <li><strong>Reference:</strong> ${data.reference}</li>
                  <li><strong>Processing Fee:</strong> ${data.processingFee} ${data.currency}</li>
                  <li><strong>Net Amount:</strong> ${data.netAmount} ${data.currency}</li>
                  <li><strong>Date:</strong> ${new Date(data.processedAt).toLocaleDateString()}</li>
                </ul>
                
                <p>The funds should arrive in your account within the specified timeframe for your chosen withdrawal method.</p>
                
                <a href="${data.transactionLink}" class="button">View Transaction</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Withdrawal Confirmed!\n\nHello ${data.firstName}!\n\nYour withdrawal of ${data.netAmount} ${data.currency} has been processed.\n\nReference: ${data.reference}\n\nView Transaction: ${data.transactionLink}\n\nWattsChain Platform`
      };

    case EMAIL_CONFIG.TEMPLATES.SECURITY_ALERT:
      return {
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyle}</head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Security Alert 🔒</h1>
              </div>
              <div class="content">
                <h2>Hello ${data.firstName}!</h2>
                
                <div class="alert">
                  <strong>Security Alert:</strong> ${data.alertType}
                </div>
                
                <h3>Details:</h3>
                <ul>
                  <li><strong>Event:</strong> ${data.eventType}</li>
                  <li><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</li>
                  <li><strong>Location:</strong> ${data.location || 'Unknown'}</li>
                  <li><strong>IP Address:</strong> ${data.ipAddress}</li>
                  <li><strong>Device:</strong> ${data.userAgent}</li>
                </ul>
                
                <p>If this was you, no action is required. If you don't recognize this activity, please:</p>
                <ol>
                  <li>Change your password immediately</li>
                  <li>Enable two-factor authentication</li>
                  <li>Review your account activity</li>
                  <li>Contact support if needed</li>
                </ol>
                
                <a href="${data.securityLink}" class="button">Review Security Settings</a>
              </div>
              <div class="footer">
                <p>&copy; 2024 WattsChain Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Security Alert\n\nHello ${data.firstName}!\n\nSecurity event: ${data.eventType}\nTime: ${new Date(data.timestamp).toLocaleString()}\nIP: ${data.ipAddress}\n\nIf this wasn't you, change your password immediately.\n\nReview Security: ${data.securityLink}\n\nWattsChain Platform`
      };

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

/**
 * Send email using the specified template
 */
export async function sendEmail(emailData: EmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    // Check rate limiting
    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    for (const recipient of recipients) {
      if (!checkRateLimit(recipient, emailData.template)) {
        throw new Error('Email rate limit exceeded for this recipient');
      }
    }

    // Generate email content
    const { html, text } = generateEmailTemplate(emailData.template, emailData.data);

    // Prepare email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: {
        name: EMAIL_CONFIG.FROM_NAME,
        address: EMAIL_CONFIG.FROM_ADDRESS
      },
      to: emailData.to,
      subject: emailData.subject,
      html,
      text,
      attachments: emailData.attachments || []
    };

    // Send email
    const transporter = getTransporter();
    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully: ${result.messageId}`);

    return {
      success: true,
      messageId: result.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(userData: {
  email: string;
  firstName: string;
  referralCode: string;
  verificationLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'Welcome to WattsChain Platform! 🎉',
    template: EMAIL_CONFIG.TEMPLATES.WELCOME,
    data: userData
  });
}

/**
 * Send email verification
 */
export async function sendEmailVerification(userData: {
  email: string;
  firstName: string;
  verificationLink: string;
  verificationCode: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'Verify Your Email Address - WattsChain',
    template: EMAIL_CONFIG.TEMPLATES.EMAIL_VERIFICATION,
    data: userData
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(userData: {
  email: string;
  firstName: string;
  resetLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'Reset Your Password - WattsChain',
    template: EMAIL_CONFIG.TEMPLATES.PASSWORD_RESET,
    data: userData
  });
}

/**
 * Send KYC approval notification
 */
export async function sendKYCApproved(userData: {
  email: string;
  firstName: string;
  dashboardLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'KYC Verification Approved! ✅',
    template: EMAIL_CONFIG.TEMPLATES.KYC_APPROVED,
    data: userData
  });
}

/**
 * Send KYC rejection notification
 */
export async function sendKYCRejected(userData: {
  email: string;
  firstName: string;
  rejectionReason: string;
  resubmitLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'KYC Verification Update - WattsChain',
    template: EMAIL_CONFIG.TEMPLATES.KYC_REJECTED,
    data: userData
  });
}

/**
 * Send commission earned notification
 */
export async function sendCommissionEarned(userData: {
  email: string;
  firstName: string;
  amount: number;
  currency: string;
  level: number;
  fromUser: string;
  earnedAt: Date;
  unlocksAt: Date;
  dashboardLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: `New Commission Earned: ${userData.amount} ${userData.currency}! 💰`,
    template: EMAIL_CONFIG.TEMPLATES.COMMISSION_EARNED,
    data: userData
  });
}

/**
 * Send commission unlocked notification
 */
export async function sendCommissionUnlocked(userData: {
  email: string;
  firstName: string;
  amount: number;
  currency: string;
  originalEarnDate: Date;
  withdrawalLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: `Commission Unlocked: ${userData.amount} ${userData.currency}! 🔓`,
    template: EMAIL_CONFIG.TEMPLATES.COMMISSION_UNLOCKED,
    data: userData
  });
}

/**
 * Send withdrawal confirmation
 */
export async function sendWithdrawalConfirmed(userData: {
  email: string;
  firstName: string;
  amount: number;
  currency: string;
  withdrawalMethod: string;
  reference: string;
  processingFee: number;
  netAmount: number;
  processedAt: Date;
  transactionLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: `Withdrawal Confirmed: ${userData.netAmount} ${userData.currency} ✅`,
    template: EMAIL_CONFIG.TEMPLATES.WITHDRAWAL_CONFIRMED,
    data: userData
  });
}

/**
 * Send security alert
 */
export async function sendSecurityAlert(userData: {
  email: string;
  firstName: string;
  alertType: string;
  eventType: string;
  timestamp: Date;
  location?: string;
  ipAddress: string;
  userAgent: string;
  securityLink: string;
}): Promise<{ success: boolean; error?: string }> {
  return await sendEmail({
    to: userData.email,
    subject: 'Security Alert - WattsChain Account',
    template: EMAIL_CONFIG.TEMPLATES.SECURITY_ALERT,
    data: userData
  });
}

/**
 * Send bulk emails (for marketing/announcements)
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  template: string,
  data: Record<string, any>
): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Send emails in batches to avoid overwhelming the server
  const batchSize = 50;
  const batches = [];
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const promises = batch.map(async (email) => {
      try {
        const result = await sendEmail({
          to: email,
          subject,
          template,
          data: { ...data, email }
        });
        
        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`${email}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${email}: ${error}`);
      }
    });

    await Promise.all(promises);
    
    // Add delay between batches to respect rate limits
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  results.success = results.failed === 0;

  console.log(`📧 Bulk email completed: ${results.sent} sent, ${results.failed} failed`);

  return results;
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    
    console.log('✅ Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('❌ Email configuration test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get email statistics
 */
export function getEmailStats(): {
  rateLimitEntries: number;
  activeConnections: number;
  configurationValid: boolean;
} {
  return {
    rateLimitEntries: emailRateLimit.size,
    activeConnections: transporter ? 1 : 0,
    configurationValid: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER)
  };
}

/**
 * Clear email rate limits (for testing or admin purposes)
 */
export function clearEmailRateLimits(): void {
  emailRateLimit.clear();
  console.log('🧹 Email rate limits cleared');
}
