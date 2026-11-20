import apiClient from './apiClient';
import type { ApiResponse, BlogPost } from '@/types';

export type { BlogPost };

interface PaginatedBlogResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export const blogService = {
  async getPosts(): Promise<BlogPost[]> {
    // Request a large limit to fetch all posts for client-side filtering/pagination
    const response = await apiClient.get<ApiResponse<PaginatedBlogResponse>>('/blog', {
      params: { limit: 100 },
    });
    const data = response.data?.data ?? response.data;
    // Server returns { posts, total, page, totalPages } inside the data envelope
    if (data && typeof data === 'object' && 'posts' in data) {
      const result = (data as PaginatedBlogResponse).posts;
      return Array.isArray(result) ? result : [];
    }
    // Fallback: if server ever returns a plain array
    if (Array.isArray(data)) return data as unknown as BlogPost[];
    return [];
  },

  async getPost(id: string): Promise<BlogPost> {
    const response = await apiClient.get<ApiResponse<BlogPost>>(`/blog/${id}`);
    const data = response.data?.data ?? response.data;
    return data as BlogPost;
  },
};

export default blogService;
