/**
 * Unit tests for blog post validation and utilities.
 */

describe('Blog Posts', () => {
  describe('Slug generation', () => {
    function generateSlug(title: string): string {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    it('should convert title to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(generateSlug('How to Use AI & ML!')).toBe('how-to-use-ai-ml');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Multiple   Spaces   Here')).toBe('multiple-spaces-here');
    });

    it('should trim leading and trailing dashes', () => {
      expect(generateSlug('--Test Title--')).toBe('test-title');
    });
  });

  describe('Excerpt generation', () => {
    function generateExcerpt(content: string, maxLength: number = 150): string {
      if (content.length <= maxLength) return content;
      const truncated = content.substring(0, maxLength);
      const lastSpace = truncated.lastIndexOf(' ');
      return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
    }

    it('should return full content if under max length', () => {
      const shortContent = 'This is a short post.';
      expect(generateExcerpt(shortContent)).toBe(shortContent);
    });

    it('should truncate long content with ellipsis', () => {
      const longContent = 'A'.repeat(200);
      const excerpt = generateExcerpt(longContent, 100);
      expect(excerpt.length).toBeLessThanOrEqual(103); // 100 + '...'
      expect(excerpt.endsWith('...')).toBe(true);
    });

    it('should break at word boundary', () => {
      const content = 'This is a test sentence that should be truncated at a word boundary when it exceeds the maximum length allowed for excerpts.';
      const excerpt = generateExcerpt(content, 50);
      expect(excerpt).not.toMatch(/\w\.\.\.$/); // Should not end mid-word
    });
  });

  describe('Category validation', () => {
    const validCategories = ['SEO', 'Marketing', 'E-commerce', 'AI Tools', 'Shopify', 'eBay', 'Etsy'];

    function isValidCategory(category: string): boolean {
      return validCategories.includes(category);
    }

    it('should accept valid categories', () => {
      expect(isValidCategory('SEO')).toBe(true);
      expect(isValidCategory('Marketing')).toBe(true);
      expect(isValidCategory('E-commerce')).toBe(true);
    });

    it('should reject invalid categories', () => {
      expect(isValidCategory('Invalid Category')).toBe(false);
      expect(isValidCategory('')).toBe(false);
    });
  });
});
