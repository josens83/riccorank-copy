import {
  sanitizeHtml,
  sanitizeInput,
  isValidEmail,
  checkPasswordStrength,
} from '@/lib/utils/security';

describe('Security Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    it('should escape ampersands', () => {
      const input = 'Tom & Jerry';
      const expected = 'Tom &amp; Jerry';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    it('should escape single quotes', () => {
      const input = "It's a test";
      const expected = 'It&#x27;s a test';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    it('should escape forward slashes', () => {
      const input = '</script>';
      const expected = '&lt;&#x2F;script&gt;';
      expect(sanitizeHtml(input)).toBe(expected);
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle plain text without special characters', () => {
      const input = 'Hello World';
      expect(sanitizeHtml(input)).toBe(input);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F';
      const expected = 'HelloWorld';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const expected = 'Hello World';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should limit length to 10000 characters', () => {
      const input = 'a'.repeat(15000);
      const result = sanitizeInput(input);
      expect(result.length).toBe(10000);
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle normal input', () => {
      const input = 'Normal text with spaces and punctuation!';
      expect(sanitizeInput(input)).toBe(input);
    });

    it('should remove null bytes', () => {
      const input = 'test\0data';
      expect(sanitizeInput(input)).not.toContain('\0');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.kr',
        'user+tag@example.com',
        'user123@test-domain.com',
        'a@b.co',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should reject email longer than 254 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(false);
    });

    it('should handle special characters in local part', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.com')).toBe(true);
    });
  });

  describe('checkPasswordStrength', () => {
    it('should consider strong password with all criteria', () => {
      const result = checkPasswordStrength('StrongPass123!');
      expect(result.isStrong).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = checkPasswordStrength('Short1!');
      expect(result.isStrong).toBe(false);
      expect(result.feedback).toContain('비밀번호는 최소 8자 이상이어야 합니다');
    });

    it('should provide feedback for missing lowercase letters', () => {
      const result = checkPasswordStrength('PASSWORD123!');
      expect(result.feedback).toContain('소문자를 포함해야 합니다');
      // Note: isStrong can still be true if score >= 4 and length >= 8
    });

    it('should provide feedback for missing uppercase letters', () => {
      const result = checkPasswordStrength('password123!');
      expect(result.feedback).toContain('대문자를 포함해야 합니다');
      // Note: isStrong can still be true if score >= 4 and length >= 8
    });

    it('should provide feedback for missing numbers', () => {
      const result = checkPasswordStrength('PasswordABC!');
      expect(result.feedback).toContain('숫자를 포함해야 합니다');
      // Note: isStrong can still be true if score >= 4 and length >= 8
    });

    it('should provide feedback for missing special characters', () => {
      const result = checkPasswordStrength('Password123');
      expect(result.feedback).toContain('특수문자를 포함해야 합니다');
      // Note: isStrong can still be true if score >= 4 and length >= 8
    });

    it('should reject very weak passwords', () => {
      const result = checkPasswordStrength('abc');
      expect(result.isStrong).toBe(false);
      expect(result.score).toBeLessThan(4);
    });

    it('should give higher score for longer passwords', () => {
      const short = checkPasswordStrength('Pass123!');
      const long = checkPasswordStrength('VeryLongPassword123!');
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('should handle empty password', () => {
      const result = checkPasswordStrength('');
      expect(result.isStrong).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should calculate correct score', () => {
      const tests = [
        { password: 'abc', expectedMaxScore: 1 }, // only lowercase
        { password: 'Abc', expectedMaxScore: 2 }, // lowercase + uppercase
        { password: 'Abc1', expectedMaxScore: 3 }, // lowercase + uppercase + number
        { password: 'Abc1!', expectedMaxScore: 4 }, // lowercase + uppercase + number + special
        { password: 'Abc123!@#$%^', expectedMaxScore: 6 }, // all criteria + length >= 12
      ];

      tests.forEach(({ password, expectedMaxScore }) => {
        const result = checkPasswordStrength(password);
        expect(result.score).toBeLessThanOrEqual(expectedMaxScore);
      });
    });

    it('should provide helpful feedback', () => {
      const result = checkPasswordStrength('weakpass');
      expect(result.feedback).toContain('대문자를 포함해야 합니다');
      expect(result.feedback).toContain('숫자를 포함해야 합니다');
      expect(result.feedback).toContain('특수문자를 포함해야 합니다');
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+'];

      specialChars.forEach(char => {
        const password = `Password123${char}`;
        const result = checkPasswordStrength(password);
        expect(result.isStrong).toBe(true);
      });
    });
  });
});
