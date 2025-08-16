import { describe, it, expect } from 'vitest';

import { formatDate, capitalizeFirst } from '@/utils/string/utils';

describe('String utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('15/01/2024');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world');
      expect(capitalizeFirst('HELLO')).toBe('HELLO');
      expect(capitalizeFirst('')).toBe('');
    });
  });
});
