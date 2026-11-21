import apiClient from './apiClient';
import JSZip from 'jszip';

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
  status?: 'SAVED' | 'FILE_MISSING';
}

/**
 * Clone a website by sending its URL to the backend.
 * Normalizes the URL (trim + strip trailing slash) before sending.
 */
export async function cloneWebsite(url: string): Promise<CloneResponse> {
  const normalizedUrl = url.trim().replace(/\/$/, '');
  const { data } = await apiClient.post('/cloner/clone', { url: normalizedUrl });
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

/**
 * Derive a safe filename from a source URL hostname.
 * e.g. "https://digiskillsacademy.icod.ai/page" → "digiskillsacademy-icod-ai"
 */
function hostnameToFilename(sourceUrl: string): string {
  try {
    const hostname = new URL(sourceUrl).hostname;
    // Replace dots and non-alphanumeric chars with hyphens, trim trailing hyphens
    return hostname.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'clone';
  } catch {
    return 'clone';
  }
}

/**
 * Download a clone file directly (for use in download button click handlers).
 * Throws on non-2xx responses so the UI can catch and show an error toast.
 */
export async function downloadCloneFile(id: string): Promise<void> {
  const downloadUrl = getDownloadUrl(id);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error('This clone file is no longer available. Please re-clone the website.');
  }
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${id}-clone.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Download a clone as a .zip file containing the single HTML file.
 * Fetches the HTML from the existing download endpoint, wraps it in a ZIP,
 * and triggers a browser download.
 * Throws on non-2xx responses so the UI can catch and show an error toast.
 */
export async function downloadCloneAsZip(id: string, sourceUrl: string): Promise<void> {
  const downloadUrl = getDownloadUrl(id);
  const response = await fetch(downloadUrl);
  if (!response.ok) {
    throw new Error('This clone file is no longer available. Please re-clone the website.');
  }
  const htmlContent = await response.text();

  const zip = new JSZip();
  const baseName = hostnameToFilename(sourceUrl);
  const htmlFileName = `${baseName}-clone.html`;
  zip.file(htmlFileName, htmlContent);

  const blob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = `${baseName}-clone.zip`;

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
