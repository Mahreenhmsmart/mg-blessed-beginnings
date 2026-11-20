import apiClient from './apiClient';

export interface AdData {
  advertiserName: string;
  advertiserEmail: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  currency?: string;
  brandColorPrimary?: string;
  brandColorSecondary?: string;
}

export interface Ad {
  _id: string;
  advertiserName: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  brandColorPrimary?: string;
  brandColorSecondary?: string;
  status: 'pending' | 'active' | 'expired' | 'rejected';
  paymentStatus: 'unpaid' | 'paid';
  purchasedAt?: string;
  expiresAt?: string;
  createdAt: string;
  impressions?: number;
  clicks?: number;
  pageViews?: Record<string, number>;
}

export interface AdStatsSummary {
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
  daysRemaining: number;
  dailyAverage: number;
  projectedMonthly: number;
  topPages: Array<{ page: string; impressions: number }>;
}

export interface AdStatsResponse {
  ads: Ad[];
  summary: AdStatsSummary;
}

export async function createAdCheckout(adData: AdData): Promise<{ url: string; adId: string }> {
  const { data } = await apiClient.post('/ads/checkout', adData);
  return data.data;
}

export async function getActiveAds(): Promise<Ad[]> {
  const { data } = await apiClient.get('/ads/active');
  return data.data;
}

export async function getMyAds(): Promise<Ad[]> {
  const { data } = await apiClient.get('/ads/my-ads');
  return data.data;
}

export async function trackImpression(adId: string, page: string): Promise<void> {
  await apiClient.post('/ads/track', { adId, page });
}

export async function trackClick(adId: string): Promise<void> {
  await apiClient.post('/ads/track-click', { adId });
}

export async function getMyAdStats(): Promise<AdStatsResponse> {
  const { data } = await apiClient.get('/ads/my-stats');
  return data.data;
}

export async function verifyAdCheckoutSession(sessionId: string): Promise<{
  status: string;
  customerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  mode: string;
}> {
  const { data } = await apiClient.get(`/ads/checkout/session?session_id=${sessionId}`);
  return data.data;
}
