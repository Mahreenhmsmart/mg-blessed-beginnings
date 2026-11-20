import apiClient from './apiClient';
import type { ContactMessage, ContactFormData, ApiResponse } from '@/types';

export const contactApiService = {
  async create(data: ContactFormData): Promise<ContactMessage> {
    const response = await apiClient.post<ApiResponse<ContactMessage>>('/contact', data);
    return response.data.data!;
  },
};
