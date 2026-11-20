import apiClient from './apiClient';

export interface ReferralRecord {
  id: string;
  referredName: string;
  referredEmail: string;
  status: string;
  creditsAwarded: number;
  createdAt: string;
}

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  credits: number;
  referrals: ReferralRecord[];
}

export interface LeaderboardEntry {
  name: string;
  totalReferrals: number;
  credits: number;
}

export async function fetchReferralStatsRequest(): Promise<{ data: ReferralStats }> {
  const { data } = await apiClient.get('/referrals/stats');
  return { data: data.data };
}

export async function applyReferralCodeRequest(code: string): Promise<{ message: string }> {
  const { data } = await apiClient.post('/referrals/apply', { code });
  return { message: data.message };
}

export async function fetchLeaderboardRequest(): Promise<{ data: LeaderboardEntry[] }> {
  const { data } = await apiClient.get('/referrals/leaderboard');
  return { data: data.data };
}
