import apiClient from './apiClient';
import type { Service, ApiResponse } from '@/types';

export const serviceApiService = {
  async getAll(): Promise<Service[]> {
    const response = await apiClient.get<ApiResponse<Service[]>>('/services');
    return response.data.data!;
  },

  async getBySlug(slug: string): Promise<Service> {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/slug/${slug}`);
    return response.data.data!;
  },
};
