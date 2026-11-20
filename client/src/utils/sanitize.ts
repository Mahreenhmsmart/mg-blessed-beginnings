/**
 * HTML Sanitization Utility
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 */

import DOMPurify from 'dompurify';

// Configure DOMPurify with safe defaults for rich text content
const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    // Block elements
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'blockquote', 'pre', 'code',
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'figure', 'figcaption', 'hr', 'br',
    // Inline elements
    'a', 'strong', 'em', 'b', 'i', 'u', 's', 'mark', 'sub', 'sup', 'small',
    // Media (with restrictions)
    'img', 'video', 'audio', 'source', 'picture',
  ],
  ALLOWED_ATTR: [
    // Common attributes
    'id', 'class', 'style', 'title', 'lang', 'dir',
    // Link attributes (href validated separately)
    'href', 'target', 'rel',
    // Image attributes
    'src', 'alt', 'width', 'height', 'loading', 'decoding',
    // Table attributes
    'colspan', 'rowspan', 'scope',
    // Data attributes for custom functionality
    'data-*',
  ],
  // Allow safe protocols only
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ['target', 'rel'],
  // Force safe link behavior
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'],
  FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
};

/**
 * Sanitize HTML string to prevent XSS attacks.
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(html, SANITIZE_CONFIG as Parameters<typeof DOMPurify.sanitize>[1]);
}

/**
 * Sanitize HTML and ensure links open in new tab with proper security attributes.
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML with secure link handling
 */
export function sanitizeRichText(html: string): string {
  const sanitized = sanitizeHtml(html);
  // Post-process to ensure all links have rel="noopener noreferrer" and target="_blank"
  const div = document.createElement('div');
  div.innerHTML = sanitized;
  div.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  return div.innerHTML;
}

/**
 * Strip all HTML tags and return plain text.
 * Useful for meta descriptions, previews, etc.
 * @param html - HTML string to strip
 * @returns Plain text without any HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
}
