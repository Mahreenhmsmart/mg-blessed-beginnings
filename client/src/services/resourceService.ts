import apiClient from './apiClient';
import type { ApiResponse } from '@/types';

export interface Resource {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: 'guide' | 'template' | 'checklist' | 'ebook' | 'worksheet';
  downloadUrl: string;
  category: string;
  thumbnail: string;
  fileSize?: string;
  format?: string;
  downloadCount: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export const resourceService = {
  async getAll(filters?: { category?: string; type?: string }): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const response = await apiClient.get<ApiResponse<Resource[]>>(`/resources${queryString ? `?${queryString}` : ''}`);
    return response.data.data!;
  },

  async getById(id: string): Promise<Resource> {
    const response = await apiClient.get<ApiResponse<Resource>>(`/resources/${id}`);
    return response.data.data!;
  },

  async getBySlug(slug: string): Promise<Resource> {
    const response = await apiClient.get<ApiResponse<Resource>>(`/resources/slug/${slug}`);
    return response.data.data!;
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/resources/categories');
    return response.data.data!;
  },

  async download(id: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<{ downloadUrl: string }>>(`/resources/${id}/download`);
    return response.data.data!.downloadUrl;
  },
};
