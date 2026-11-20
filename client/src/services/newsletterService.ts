import apiClient from './apiClient';

export interface SubscribeResponse {
  success: boolean;
  message: string;
  isNew: boolean;
}

export async function subscribeToNewsletter(
  email: string,
  source?: string
): Promise<SubscribeResponse> {
  const { data } = await apiClient.post('/newsletter/subscribe', { email, source });
  return data;
}
