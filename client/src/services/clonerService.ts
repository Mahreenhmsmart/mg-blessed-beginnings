import apiClient from './apiClient';

export interface CloneResponse {
  id: string;
  source: string;
  bytes: number;
  createdAt: string;
  warning?: string;
}

export interface RecentCloneItem {
  id: string;
  source: string;
  bytes: number;
  createdAt: string;
}

/**
 * Clone a website by sending its URL to the backend.
 */
export async function cloneWebsite(url: string): Promise<CloneResponse> {
  const { data } = await apiClient.post('/cloner/clone', { url });
  return data.data;
}

/**
 * Fetch the list of recent clones.
 */
export async function getRecentClones(): Promise<RecentCloneItem[]> {
  const { data } = await apiClient.get('/cloner/clones');
  return data.data;
}

/**
 * Get the preview URL for a clone.
 */
export function getPreviewUrl(id: string): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}/cloner/preview/${id}`;
}

/**
 * Get the download URL for a clone.
 */
export function getDownloadUrl(id: string): string {
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}/cloner/download/${id}`;
}
