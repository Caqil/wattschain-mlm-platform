import { User } from '@/models/User';
import { MLMTree } from '@/models/MLMTree';
import { Commission } from '@/models/Commission';
import { Transaction } from '@/models/Transaction';
import { Wallet } from '@/models/Wallet';
import { MLM_CONFIG, MLM_COMMISSION_RATES, FRAUD_DETECTION } from './constants';
import { connectDatabase, withTransaction } from './database';
import { sendCommissionEarned } from './email';
import { MLMTreeNode, MLMTreeStats, Commission as CommissionType, FraudDetectionResult, FraudFlag } from '@/types/mlm';
import { ClientSession } from 'mongoose';

/**
 * Add user to MLM tree structure
 */
export async function addUserToMLMTree(
  userId: string,
  referrerId?: string,
  session?: ClientSession
): Promise<{
  success: boolean;
  mlmTreeId?: string;
  error?: string;
}> {
  try {
    await connectDatabase();

    const operation = async (currentSession: ClientSession) => {
      // Verify user exists and is eligible
      const user = await User.findById(userId).session(currentSession);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already exists in MLM tree
      const existingTree = await MLMTree.findOne({ userId }).session(currentSession);
      if (existingTree) {
        throw new Error('User already exists in MLM tree');
      }

      let level = 0;
      let uplineMembers: string[] = [];
      let referrer = null;

      if (referrerId) {
        // Verify referrer exists and is active
        referrer = await User.findById(referrerId).session(currentSession);
        if (!referrer || !referrer.isActive || referrer.isBanned) {
          throw new Error('Invalid or inactive referrer');
        }

        // Get referrer's MLM tree data
        const referrerTree = await MLMTree.findOne({ userId: referrerId }).session(currentSession);
        if (!referrerTree) {
          throw new Error('Referrer not found in MLM tree');
        }

        level = Math.min(referrerTree.level + 1, MLM_CONFIG.MAX_MLM_LEVELS);
        
        // Build upline chain (max 5 levels)
        uplineMembers = [referrerId, ...referrerTree.uplineMembers].slice(0, MLM_CONFIG.MAX_MLM_LEVELS);

        // Update referrer's downline count
        referrerTree.directReferrals += 1;
        referrerTree.totalDownlineCount += 1;
        referrerTree.downlineMembers.push(userId);
        
        // Update level counts
        referrerTree.level1Count += 1;
        
        await referrerTree.save({ session: currentSession });

        // Update upline member counts
        for (let i = 0; i < uplineMembers.length; i++) {
          const uplineMemberId = uplineMembers[i];
          const uplineTree = await MLMTree.findOne({ userId: uplineMemberId }).session(currentSession);
          
          if (uplineTree) {
            uplineTree.totalDownlineCount += 1;
            
            // Update appropriate level count
            const levelKey = `level${i + 2}Count` as keyof typeof uplineTree;
            if (i < 4 && uplineTree[levelKey] !== undefined) {
              (uplineTree[levelKey] as number) += 1;
            }
            
            await uplineTree.save({ session: currentSession });
          }
        }
      }

      // Create MLM tree entry
      const mlmTree = new MLMTree({
        userId,
        referrerId,
        level,
        position: Date.now(), // Simple position based on timestamp
        uplineMembers,
        downlineMembers: [],
        totalDownlineCount: 0,
        directReferrals: 0,
        totalVolume: 0,
        personalVolume: 0,
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        level4Count: 0,
        level5Count: 0,
        isActive: false, // Will be activated after first purchase
        isSuspicious: false,
        fraudFlags: []
      });

      await mlmTree.save({ session: currentSession });

      console.log(`✅ Added user ${userId} to MLM tree with referrer ${referrerId || 'none'}`);

      return { mlmTreeId: mlmTree._id.toString() };
    };

    if (session) {
      const result = await operation(session);
      return { success: true, ...result };
    } else {
      const result = await withTransaction(operation);
      return { success: true, ...result };
    }

  } catch (error) {
    console.error('❌ Failed to add user to MLM tree:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add user to MLM tree'
    };
  }
}

/**
 * Activate MLM eligibility after qualifying purchase
 */
export async function activateMLMEligibility(
  userId: string,
  purchaseAmount: number,
  session?: ClientSession
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await connectDatabase();

    const operation = async (currentSession: ClientSession) => {
      // Check if purchase meets minimum requirement
      if (purchaseAmount < MLM_CONFIG.MIN_PURCHASE_AMOUNT) {
        throw new Error(`Purchase amount ${purchaseAmount} below minimum requirement ${MLM_CONFIG.MIN_PURCHASE_AMOUNT}`);
      }

      // Update user's MLM eligibility
      const user = await User.findById(userId).session(currentSession);
      if (!user) {
        throw new Error('User not found');
      }

      user.isMLMEligible = true;
      user.mlmActivationDate = new Date();
      user.totalPurchaseAmount += purchaseAmount;
      await user.save({ session: currentSession });

      // Activate MLM tree entry
      const mlmTree = await MLMTree.findOne({ userId }).session(currentSession);
      if (mlmTree) {
        mlmTree.isActive = true;
        mlmTree.activatedAt = new Date();
        mlmTree.personalVolume += purchaseAmount;
        await mlmTree.save({ session: currentSession });
      }

      console.log(`✅ Activated MLM eligibility for user ${userId} with purchase ${purchaseAmount}`);
    };

    if (session) {
      await operation(session);
    } else {
      await withTransaction(operation);
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Failed to activate MLM eligibility:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate MLM eligibility'
    };
  }
}

/**
 * Calculate and distribute commissions for a purchase
 */
export async function calculateAndDistributeCommissions(
  buyerUserId: string,
  transactionId: string,
  purchaseAmount: number,
  session?: ClientSession
): Promise<{
  success: boolean;
  commissionsCreated: number;
  totalCommissionAmount: number;
  error?: string;
}> {
  try {
    await connectDatabase();

    const operation = async (currentSession: ClientSession) => {
      // Get buyer's MLM tree data
      const buyerTree = await MLMTree.findOne({ userId: buyerUserId }).session(currentSession);
      if (!buyerTree || buyerTree.uplineMembers.length === 0) {
        console.log(`ℹ️ No upline members for user ${buyerUserId}, no commissions to distribute`);
        return { commissionsCreated: 0, totalCommissionAmount: 0 };
      }

      const commissionsCreated: CommissionType[] = [];
      let totalCommissionAmount = 0;

      // Calculate commissions for each upline level
      for (let i = 0; i < buyerTree.uplineMembers.length && i < MLM_CONFIG.MAX_MLM_LEVELS; i++) {
        const uplineUserId = buyerTree.uplineMembers[i];
        const level = i + 1;
        const commissionRate = MLM_COMMISSION_RATES[level as keyof typeof MLM_COMMISSION_RATES];

        // Verify upline user is eligible for commissions
        const uplineUser = await User.findById(uplineUserId).session(currentSession);
        if (!uplineUser || !uplineUser.isMLMEligible || !uplineUser.isActive || uplineUser.isBanned) {
          console.log(`⚠️ Skipping commission for ineligible user ${uplineUserId} at level ${level}`);
          continue;
        }

        // Check if upline user meets purchase requirement
        if (uplineUser.totalPurchaseAmount < MLM_CONFIG.MIN_PURCHASE_AMOUNT) {
          console.log(`⚠️ Skipping commission for user ${uplineUserId} - insufficient purchase amount`);
          continue;
        }

        // Calculate commission amount
        const commissionAmount = (purchaseAmount * commissionRate) / 100;
        
        // Calculate lock period (12 months from now)
        const lockedUntil = new Date();
        lockedUntil.setMonth(lockedUntil.getMonth() + MLM_CONFIG.COMMISSION_LOCK_PERIOD_MONTHS);

        // Create commission record
        const commission = new Commission({
          userId: uplineUserId,
          fromUserId: buyerUserId,
          transactionId,
          amount: commissionAmount,
          percentage: commissionRate,
          level,
          sourceAmount: purchaseAmount,
          isLocked: true,
          lockedUntil,
          lockPeriodMonths: MLM_CONFIG.COMMISSION_LOCK_PERIOD_MONTHS,
          status: 'locked',
          earnedAt: new Date()
        });

        await commission.save({ session: currentSession });
        commissionsCreated.push(commission);
        totalCommissionAmount += commissionAmount;

        // Update user's wallet
        await updateWalletCommission(uplineUserId, commissionAmount, true, currentSession);

        // Update upline tree volume
        const uplineTree = await MLMTree.findOne({ userId: uplineUserId }).session(currentSession);
        if (uplineTree) {
          uplineTree.totalVolume += purchaseAmount;
          await uplineTree.save({ session: currentSession });
        }

        console.log(`💰 Created commission: ${commissionAmount} for user ${uplineUserId} from level ${level}`);
      }

      // Send commission earned notifications
      for (const commission of commissionsCreated) {
        const uplineUser = await User.findById(commission.userId).session(currentSession);
        if (uplineUser) {
          await sendCommissionEarned({
            email: uplineUser.email,
            firstName: uplineUser.firstName,
            amount: commission.amount,
            currency: 'KES',
            level: commission.level,
            fromUser: `${buyerTree.userId}`, // In real app, get buyer's name
            earnedAt: commission.earnedAt,
            unlocksAt: commission.lockedUntil,
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
          });
        }
      }

      return {
        commissionsCreated: commissionsCreated.length,
        totalCommissionAmount
      };
    };

    if (session) {
      const result = await operation(session);
      return { success: true, ...result };
    } else {
      const result = await withTransaction(operation);
      return { success: true, ...result };
    }

  } catch (error) {
    console.error('❌ Failed to calculate and distribute commissions:', error);
    return {
      success: false,
      commissionsCreated: 0,
      totalCommissionAmount: 0,
      error: error instanceof Error ? error.message : 'Failed to distribute commissions'
    };
  }
}

/**
 * Update wallet commission balances
 */
async function updateWalletCommission(
  userId: string,
  commissionAmount: number,
  isLocked: boolean,
  session: ClientSession
): Promise<void> {
  let wallet = await Wallet.findOne({ userId }).session(session);
  
  if (!wallet) {
    wallet = new Wallet({ userId });
  }

  wallet.totalCommissionsEarned += commissionAmount;
  
  if (isLocked) {
    wallet.lockedBalance += commissionAmount;
  } else {
    wallet.availableBalance += commissionAmount;
  }

  await wallet.save({ session });
}

/**
 * Unlock commissions that have completed their lock period
 */
export async function unlockExpiredCommissions(): Promise<{
  success: boolean;
  unlockedCount: number;
  totalAmount: number;
  error?: string;
}> {
  try {
    await connectDatabase();

    const now = new Date();
    
    return await withTransaction(async (session) => {
      // Find commissions that are locked but past their unlock date
      const expiredCommissions = await Commission.find({
        status: 'locked',
        lockedUntil: { $lte: now }
      }).session(session);

      let totalAmount = 0;

      for (const commission of expiredCommissions) {
        // Update commission status
        commission.status = 'unlocked';
        commission.unlockedAt = new Date();
        await commission.save({ session });

        // Update wallet balances
        const wallet = await Wallet.findOne({ userId: commission.userId }).session(session);
        if (wallet) {
          wallet.lockedBalance -= commission.amount;
          wallet.availableBalance += commission.amount;
          await wallet.save({ session });
        }

        totalAmount += commission.amount;

        console.log(`🔓 Unlocked commission ${commission._id} for user ${commission.userId}: ${commission.amount}`);
      }

      console.log(`✅ Unlocked ${expiredCommissions.length} commissions totaling ${totalAmount}`);

      return {
        unlockedCount: expiredCommissions.length,
        totalAmount
      };
    });

  } catch (error) {
    console.error('❌ Failed to unlock expired commissions:', error);
    return {
      success: false,
      unlockedCount: 0,
      totalAmount: 0,
      error: error instanceof Error ? error.message : 'Failed to unlock commissions'
    };
  }
}

/**
 * Get MLM tree data for a user
 */
export async function getMLMTreeData(userId: string): Promise<{
  success: boolean;
  treeData?: MLMTreeNode;
  error?: string;
}> {
  try {
    await connectDatabase();

    const mlmTree = await MLMTree.findOne({ userId })
      .populate('userId', 'username firstName lastName email avatar')
      .populate('uplineMembers', 'username firstName lastName email')
      .populate('downlineMembers', 'username firstName lastName email')
      .lean();

    if (!mlmTree) {
      throw new Error('MLM tree data not found');
    }

    const treeData: MLMTreeNode = {
      id: mlmTree.id.toString(),
      userId: mlmTree.userId.id.toString(),
      user: {
        id: mlmTree.userId.id.toString(),
        username: mlmTree.userId.username,
        fullName: `${mlmTree.userId.firstName} ${mlmTree.userId.lastName}`,
        email: mlmTree.userId.email,
        avatar: mlmTree.userId.avatar
      },
      referrerId: mlmTree.referrerId,
      level: mlmTree.level,
      position: mlmTree.position,
      uplineMembers: mlmTree.uplineMembers.map((m: any) => m._id.toString()),
      downlineMembers: mlmTree.downlineMembers.map((m: any) => m._id.toString()),
      totalDownlineCount: mlmTree.totalDownlineCount,
      directReferrals: mlmTree.directReferrals,
      totalVolume: mlmTree.totalVolume,
      personalVolume: mlmTree.personalVolume,
      level1Count: mlmTree.level1Count,
      level2Count: mlmTree.level2Count,
      level3Count: mlmTree.level3Count,
      level4Count: mlmTree.level4Count,
      level5Count: mlmTree.level5Count,
      isActive: mlmTree.isActive,
      activatedAt: mlmTree.activatedAt,
      isSuspicious: mlmTree.isSuspicious,
      fraudFlags: mlmTree.fraudFlags,
      createdAt: mlmTree.createdAt
    };

    return {
      success: true,
      treeData
    };

  } catch (error) {
    console.error('❌ Failed to get MLM tree data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get MLM tree data'
    };
  }
}

/**
 * Validate referral code
 */
export async function validateReferralCode(referralCode: string): Promise<{
  valid: boolean;
  userId?: string;
  user?: any;
  error?: string;
}> {
  try {
    await connectDatabase();

    const user = await User.findOne({ 
      referralCode,
      isActive: true,
      isBanned: false
    }).select('_id username firstName lastName email isMLMEligible').lean();

    if (!user) {
      return {
        valid: false,
        error: 'Invalid or inactive referral code'
      };
    }

    return {
      valid: true,
      userId: user.id.toString(),
      user: {
        id: user.id.toString(),
        username: user.username,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isMLMEligible: user.isMLMEligible
      }
    };

  } catch (error) {
    console.error('❌ Failed to validate referral code:', error);
    return {
      valid: false,
      error: 'Failed to validate referral code'
    };
  }
}

/**
 * Detect and flag suspicious MLM activity
 */
export async function detectMLMFraud(userId: string): Promise<FraudDetectionResult> {
  try {
    await connectDatabase();

    const flags: FraudFlag[] = [];
    let riskScore = 0;

    // Get user and MLM data
    const [user, mlmTree, recentTransactions] = await Promise.all([
      User.findById(userId),
      MLMTree.findOne({ userId }),
      Transaction.find({ 
        userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      })
    ]);

    if (!user || !mlmTree) {
      return {
        isSuspicious: false,
        riskScore: 0,
        flags: [],
        recommendations: []
      };
    }

    // Check for rapid referral pattern
    if (mlmTree.directReferrals > FRAUD_DETECTION.THRESHOLDS.MAX_REFERRALS_PER_DAY) {
      flags.push({
        type: 'rapid_referrals',
        severity: 'high',
        description: `User has ${mlmTree.directReferrals} direct referrals, exceeding daily limit`,
        evidence: { referralCount: mlmTree.directReferrals }
      });
      riskScore += 0.4;
    }

    // Check for suspicious transaction patterns
    if (recentTransactions.length > FRAUD_DETECTION.THRESHOLDS.MAX_PURCHASES_PER_HOUR) {
      flags.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'Unusual transaction frequency detected',
        evidence: { transactionCount: recentTransactions.length }
      });
      riskScore += 0.3;
    }

    // Check for large transaction amounts
    const largeTransactions = recentTransactions.filter(
      t => t.amount > FRAUD_DETECTION.THRESHOLDS.SUSPICIOUS_AMOUNT_THRESHOLD
    );

    if (largeTransactions.length > 0) {
      flags.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'Large transaction amounts detected',
        evidence: { largeTransactionCount: largeTransactions.length }
      });
      riskScore += 0.2;
    }

    // Check for duplicate IP addresses in downline
    const downlineUsers = await User.find({
      _id: { $in: mlmTree.downlineMembers }
    }).select('ipAddress');

    const ipMap = new Map<string, number>();
    downlineUsers.forEach(u => {
      if (u.ipAddress) {
        ipMap.set(u.ipAddress, (ipMap.get(u.ipAddress) || 0) + 1);
      }
    });

    const duplicateIPs = Array.from(ipMap.entries()).filter(([ip, count]) => count > FRAUD_DETECTION.THRESHOLDS.MAX_ACCOUNTS_PER_IP);
    
    if (duplicateIPs.length > 0) {
      flags.push({
        type: 'duplicate_ip',
        severity: 'high',
        description: 'Multiple downline users sharing IP addresses',
        evidence: { duplicateIPs: duplicateIPs.map(([ip, count]) => ({ ip, count })) }
      });
      riskScore += 0.5;
    }

    // Determine if suspicious
    const isSuspicious = riskScore >= FRAUD_DETECTION.RISK_SCORES.MEDIUM;

    // Generate recommendations
    const recommendations: string[] = [];
    if (isSuspicious) {
      recommendations.push('Flag account for manual review');
      recommendations.push('Temporarily restrict MLM activities');
      recommendations.push('Require additional KYC verification');
      
      if (flags.some(f => f.type === 'duplicate_ip')) {
        recommendations.push('Investigate potential account farming');
      }
    }

    // Update MLM tree with fraud flags if suspicious
    if (isSuspicious) {
      mlmTree.isSuspicious = true;
      mlmTree.fraudFlags = flags.map(f => f.type);
      mlmTree.lastAuditDate = new Date();
      await mlmTree.save();
    }

    return {
      isSuspicious,
      riskScore,
      flags,
      recommendations
    };

  } catch (error) {
    console.error('❌ MLM fraud detection failed:', error);
    return {
      isSuspicious: false,
      riskScore: 0,
      flags: [],
      recommendations: ['Error in fraud detection - manual review required']
    };
  }
}

/**
 * Get MLM analytics and statistics
 */
export async function getMLMAnalytics(): Promise<MLMTreeStats> {
  try {
    await connectDatabase();

    const [
      totalMembers,
      activeMembers,
      totalVolumeResult,
      levelDistribution,
      maxDepthResult
    ] = await Promise.all([
      MLMTree.countDocuments(),
      MLMTree.countDocuments({ isActive: true }),
      MLMTree.aggregate([
        { $group: { _id: null, totalVolume: { $sum: '$totalVolume' } } }
      ]),
      MLMTree.aggregate([
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]),
      MLMTree.find().sort({ level: -1 }).limit(1).select('level')
    ]);

    const totalVolume = totalVolumeResult[0]?.totalVolume || 0;
    const maxDepth = maxDepthResult[0]?.level || 0;

    // Calculate average depth
    const allLevels = await MLMTree.find().select('level');
    const averageDepth = allLevels.length > 0 
      ? allLevels.reduce((sum, tree) => sum + tree.level, 0) / allLevels.length
      : 0;

    // Build level distribution
    const levelDistrib: Record<number, number> = {};
    levelDistribution.forEach((item: any) => {
      levelDistrib[item._id] = item.count;
    });

    return {
      totalMembers,
      activeMembers,
      totalVolume,
      averageDepth,
      maxDepth,
      levelDistribution: levelDistrib
    };

  } catch (error) {
    console.error('❌ Failed to get MLM analytics:', error);
    throw error;
  }
}

/**
 * Audit MLM tree integrity
 */
export async function auditMLMTreeIntegrity(): Promise<{
  success: boolean;
  issues: string[];
  fixedIssues: number;
  error?: string;
}> {
  try {
    await connectDatabase();

    const issues: string[] = [];
    let fixedIssues = 0;

    return await withTransaction(async (session) => {
      // Check for orphaned nodes
      const orphanedNodes = await MLMTree.find({
        referrerId: { $ne: null },
        $expr: {
          $not: {
            $in: ['$referrerId', await User.find().distinct('_id')]
          }
        }
      }).session(session);

      if (orphanedNodes.length > 0) {
        issues.push(`Found ${orphanedNodes.length} orphaned nodes`);
        
        // Fix orphaned nodes by removing invalid referrer
        for (const node of orphanedNodes) {
          node.referrerId = undefined;
          node.level = 0;
          node.uplineMembers = [];
          await node.save({ session });
          fixedIssues++;
        }
      }

      // Check for inconsistent level counts
      const allNodes = await MLMTree.find().session(session);
      
      for (const node of allNodes) {
        const actualCounts = {
          level1: 0,
          level2: 0,
          level3: 0,
          level4: 0,
          level5: 0
        };

        // Count actual downline at each level
        for (const downlineId of node.downlineMembers) {
          const downlineNode = await MLMTree.findOne({ userId: downlineId }).session(session);
          if (downlineNode) {
            const levelDiff = downlineNode.level - node.level;
            if (levelDiff === 1) actualCounts.level1++;
            else if (levelDiff === 2) actualCounts.level2++;
            else if (levelDiff === 3) actualCounts.level3++;
            else if (levelDiff === 4) actualCounts.level4++;
            else if (levelDiff === 5) actualCounts.level5++;
          }
        }

        // Check for mismatches
        const mismatches = [];
        if (node.level1Count !== actualCounts.level1) mismatches.push('level1');
        if (node.level2Count !== actualCounts.level2) mismatches.push('level2');
        if (node.level3Count !== actualCounts.level3) mismatches.push('level3');
        if (node.level4Count !== actualCounts.level4) mismatches.push('level4');
        if (node.level5Count !== actualCounts.level5) mismatches.push('level5');

        if (mismatches.length > 0) {
          issues.push(`Node ${node.userId} has incorrect level counts: ${mismatches.join(', ')}`);
          
          // Fix level counts
          node.level1Count = actualCounts.level1;
          node.level2Count = actualCounts.level2;
          node.level3Count = actualCounts.level3;
          node.level4Count = actualCounts.level4;
          node.level5Count = actualCounts.level5;
          await node.save({ session });
          fixedIssues++;
        }
      }

      console.log(`🔍 MLM tree audit completed: ${issues.length} issues found, ${fixedIssues} fixed`);

      return { issues, fixedIssues };
    });

  } catch (error) {
    console.error('❌ MLM tree audit failed:', error);
    return {
      success: false,
      issues: [],
      fixedIssues: 0,
      error: error instanceof Error ? error.message : 'Audit failed'
    };
  }
}
