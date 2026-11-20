import apiClient from './apiClient';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';

export async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', credentials);
  // Backend returns { success, data: { token, user } } — unwrap the envelope
  return data.data as AuthResponse;
}

export async function registerRequest(credentials: RegisterCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/signup', credentials);
  // Backend returns { success, data: { token, user } } — unwrap the envelope
  return data.data as AuthResponse;
}
