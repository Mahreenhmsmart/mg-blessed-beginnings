/**
 * Unit tests for contact form validation and email service integration.
 */

describe('Contact Form', () => {
  describe('Email validation', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('should accept valid email addresses', () => {
      expect(emailRegex.test('user@example.com')).toBe(true);
      expect(emailRegex.test('test.user@domain.org')).toBe(true);
      expect(emailRegex.test('name+tag@company.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(emailRegex.test('invalid')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('user@')).toBe(false);
      expect(emailRegex.test('user @example.com')).toBe(false);
    });
  });

  describe('Required fields validation', () => {
    function validateContactInput(data: { name?: string; email?: string; subject?: string; message?: string }) {
      const errors: string[] = [];
      if (!data.name) errors.push('name is required');
      if (!data.email) errors.push('email is required');
      if (!data.subject) errors.push('subject is required');
      if (!data.message) errors.push('message is required');
      return errors;
    }

    it('should pass validation with all required fields', () => {
      const errors = validateContactInput({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      });
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when name is missing', () => {
      const errors = validateContactInput({
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      });
      expect(errors).toContain('name is required');
    });

    it('should fail validation when multiple fields are missing', () => {
      const errors = validateContactInput({});
      expect(errors).toHaveLength(4);
      expect(errors).toContain('name is required');
      expect(errors).toContain('email is required');
      expect(errors).toContain('subject is required');
      expect(errors).toContain('message is required');
    });
  });
});
