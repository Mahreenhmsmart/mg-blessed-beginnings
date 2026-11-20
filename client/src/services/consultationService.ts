import apiClient from './apiClient';
import type { Consultation, ConsultationFormData, ApiResponse } from '@/types';

export const consultationService = {
  async create(data: ConsultationFormData): Promise<Consultation> {
    const response = await apiClient.post<ApiResponse<Consultation>>('/consultations', data);
    return response.data.data!;
  },
};
