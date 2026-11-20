/**
 * Extract the Google Drive file ID from a /preview or /view URL
 * and return a thumbnail URL suitable for use as a video poster image.
 *
 * Supported formats:
 *   https://drive.google.com/file/d/<ID>/preview
 *   https://drive.google.com/file/d/<ID>/view
 *   https://drive.google.com/file/d/<ID>/...
 *
 * Returns an empty string when the input is not a recognisable Drive URL.
 */
export function getDriveThumbnail(previewUrl: string | undefined): string {
  if (!previewUrl) return '';
  const match = previewUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return '';
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
}
