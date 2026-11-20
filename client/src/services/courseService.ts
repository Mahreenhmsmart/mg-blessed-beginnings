import apiClient from './apiClient';
import type { ApiResponse } from '@/types';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  instructor: string;
  modules: Array<{
    title: string;
    lessons: Array<{
      title: string;
      content: string;
      videoUrl?: string;
      duration?: number;
    }>;
  }>;
  price: number;
  status: 'draft' | 'published';
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledCount: number;
  createdAt: string;
  updatedAt: string;
}

export const courseService = {
  async getAll(filters?: { category?: string; level?: string }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.level) params.append('level', filters.level);
    
    const queryString = params.toString();
    const response = await apiClient.get<ApiResponse<Course[]>>(`/courses${queryString ? `?${queryString}` : ''}`);
    return response.data.data!;
  },

  async getById(id: string): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data!;
  },

  async getBySlug(slug: string): Promise<Course> {
    const response = await apiClient.get<ApiResponse<Course>>(`/courses/slug/${slug}`);
    return response.data.data!;
  },

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/courses/categories');
    return response.data.data!;
  },
};
