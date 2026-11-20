import apiClient from './apiClient';

export interface SubscriptionStatus {
  hasSubscription: boolean;
  status: string;
  plan: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export async function createCheckoutSession(_plan: string = 'pro'): Promise<{ url: string }> {
  const { data } = await apiClient.post('/subscriptions/create-checkout', { plan: _plan });
  return data.data;
}

export async function verifySession(_sessionId: string): Promise<{
  status: string;
  customerEmail: string | null;
  amountTotal: number | null;
  currency: string | null;
  mode: string;
}> {
  const { data } = await apiClient.post('/subscriptions/verify', { sessionId: _sessionId });
  return data.data;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data } = await apiClient.get('/subscriptions/status');
  return data.data;
}

export async function cancelSubscription(): Promise<void> {
  await apiClient.post('/subscriptions/cancel');
}
