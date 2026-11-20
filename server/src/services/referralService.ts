import User, { type IUser } from '../models/User';
import Referral from '../models/Referral';

const CREDITS_PER_REFERRAL = 5;

export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (!user.referralCode) {
    // Should be auto-generated on save, but ensure it exists
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    user.referralCode = code;
    await user.save();
  }
  return user.referralCode;
}

export async function applyReferralCode(
  newUserId: string,
  code: string,
): Promise<{ success: boolean; message: string }> {
  const trimmedCode = code.trim().toUpperCase();

  // Check if the new user already has a referrer
  const newUser = await User.findById(newUserId);
  if (!newUser) throw new Error('User not found');

  if (newUser.referredBy) {
    return { success: false, message: 'Referral code already applied.' };
  }

  // Look up the referrer by code
  const referrer = await User.findOne({ referralCode: trimmedCode });
  if (!referrer) {
    return { success: false, message: 'Invalid referral code.' };
  }

  // Cannot refer yourself
  if (referrer._id.toString() === newUserId) {
    return { success: false, message: 'You cannot use your own referral code.' };
  }

  // Check idempotency — has this pair already been recorded?
  const existing = await Referral.findOne({
    referrer: referrer._id,
    referred: newUser._id,
  });
  if (existing) {
    return { success: false, message: 'Referral code already applied.' };
  }

  // Award credits to both users
  await User.findByIdAndUpdate(referrer._id, {
    $inc: { credits: CREDITS_PER_REFERRAL, totalReferrals: 1 },
  });
  await User.findByIdAndUpdate(newUser._id, {
    $set: { referredBy: referrer._id },
    $inc: { credits: CREDITS_PER_REFERRAL },
  });

  // Create the referral record
  await Referral.create({
    referrer: referrer._id,
    referred: newUser._id,
    status: 'completed',
    creditsAwarded: CREDITS_PER_REFERRAL,
  });

  return { success: true, message: `+${CREDITS_PER_REFERRAL} credits awarded to both you and your referrer!` };
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  credits: number;
  referrals: Array<{
    id: string;
    referredName: string;
    referredEmail: string;
    status: string;
    creditsAwarded: number;
    createdAt: Date;
  }>;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const code = await getOrCreateReferralCode(userId);

  const referrals = await Referral.find({ referrer: user._id })
    .sort({ createdAt: -1 })
    .populate('referred', 'name email')
    .lean();

  return {
    code,
    totalReferrals: user.totalReferrals,
    credits: user.credits,
    referrals: referrals.map((r) => {
      const referredUser = r.referred as unknown as IUser | null;
      return {
        id: r._id.toString(),
        referredName: referredUser?.name || 'Unknown',
        referredEmail: referredUser?.email || '',
        status: r.status,
        creditsAwarded: r.creditsAwarded,
        createdAt: r.createdAt,
      };
    }),
  };
}

export interface LeaderboardEntry {
  name: string;
  totalReferrals: number;
  credits: number;
}

export async function getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const topUsers = await User.find({ totalReferrals: { $gt: 0 } })
    .sort({ totalReferrals: -1 })
    .limit(limit)
    .select('name totalReferrals credits')
    .lean();

  return topUsers.map((u) => ({
    name: u.name,
    totalReferrals: u.totalReferrals,
    credits: u.credits,
  }));
}
