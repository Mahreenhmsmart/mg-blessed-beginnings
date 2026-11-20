import apiClient from './apiClient';

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface VerifyPaymentResponse {
  status: string;
  paid: boolean;
  errorMessage?: string;
  amount: number;
  currency: string;
}

/**
 * Payment processing is not currently configured.
 */
export async function createPaymentIntent(
  _amount: number,
  _currency: string = 'usd',
  _description?: string,
  _paymentAttemptId?: string,
): Promise<CreatePaymentIntentResponse> {
  const { data } = await apiClient.post('/payments/create-intent', {});
  return data.data;
}

/**
 * Payment processing is not currently configured.
 */
export async function verifyPayment(_paymentIntentId: string): Promise<VerifyPaymentResponse> {
  const { data } = await apiClient.post('/payments/verify', {});
  return data.data;
}
