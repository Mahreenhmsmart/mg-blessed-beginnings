import apiClient from './apiClient';
import type { Project } from '@/types';

export async function createProject(data: { url: string; name: string; competitors?: string[] }): Promise<Project> {
  const { data: res } = await apiClient.post('/projects', data);
  return res.data;
}

export async function getProjects(): Promise<Project[]> {
  const { data: res } = await apiClient.get('/projects');
  return res.data;
}

export async function getProjectById(id: string): Promise<Project> {
  const { data: res } = await apiClient.get(`/projects/${id}`);
  return res.data;
}

export async function updateProject(id: string, data: { name?: string; url?: string; competitors?: string[] }): Promise<Project> {
  const { data: res } = await apiClient.patch(`/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

// PDF Report download
export async function downloadPDFReport(projectId: string): Promise<Blob> {
  const response = await apiClient.get(`/projects/${projectId}/reports/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

// CSV Report download
export async function downloadCSVReport(projectId: string): Promise<Blob> {
  const response = await apiClient.get(`/projects/${projectId}/reports/csv`, {
    responseType: 'blob',
  });
  return response.data;
}
