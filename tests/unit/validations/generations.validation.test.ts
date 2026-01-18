/**
 * Unit Tests - Generations Validation Schema
 * 
 * Tests validation logic for flashcard generation requests.
 * Priority 1: Critical validation that prevents API abuse and ensures quality.
 */

import { describe, it, expect } from 'vitest';
import { triggerGenerationSchema } from '@/lib/validations/generations.validation';

describe('Generations Validation', () => {
  describe('triggerGenerationSchema', () => {
    describe('valid generation requests', () => {
      it('should accept input text with exactly 1000 characters (minimum)', () => {
        const validRequest = {
          input_text: 'A'.repeat(1000),
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept input text with exactly 10000 characters (maximum)', () => {
        const validRequest = {
          input_text: 'A'.repeat(10000),
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept input text with 5000 characters (middle range)', () => {
        const validRequest = {
          input_text: 'A'.repeat(5000),
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept input text with mixed content', () => {
        const validText = `
          React is a JavaScript library for building user interfaces.
          ${'Learn React by building projects. '.repeat(100)}
          TypeScript adds static typing to JavaScript.
        `.trim();
        
        // Ensure it's within valid range
        const paddedText = validText.padEnd(1000, ' ');

        const validRequest = {
          input_text: paddedText,
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept input text with special characters and newlines', () => {
        const validText = 'Line 1\nLine 2\nSpecial chars: !@#$%^&*()'.padEnd(1000, ' ');
        const validRequest = {
          input_text: validText,
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should accept input text with unicode characters', () => {
        const validText = 'Unicode: 你好世界 🚀 Привет мир'.padEnd(1000, ' ');
        const validRequest = {
          input_text: validText,
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid generation requests', () => {
      it('should reject input text shorter than 1000 characters', () => {
        const invalidRequest = {
          input_text: 'A'.repeat(999),
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 1000 characters');
        }
      });

      it('should reject input text longer than 10000 characters', () => {
        const invalidRequest = {
          input_text: 'A'.repeat(10001),
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('must not exceed 10000 characters');
        }
      });

      it('should reject empty input text', () => {
        const invalidRequest = {
          input_text: '',
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 1000 characters');
        }
      });

      it('should reject missing input_text field', () => {
        const invalidRequest = {};

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject input text with only 100 characters', () => {
        const invalidRequest = {
          input_text: 'Short text with only 100 chars'.padEnd(100, ' '),
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject input text with only 500 characters', () => {
        const invalidRequest = {
          input_text: 'A'.repeat(500),
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject input text with 15000 characters (way over limit)', () => {
        const invalidRequest = {
          input_text: 'A'.repeat(15000),
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject non-string input_text', () => {
        const invalidRequest = {
          input_text: 12345,
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject null input_text', () => {
        const invalidRequest = {
          input_text: null,
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });

      it('should reject undefined input_text', () => {
        const invalidRequest = {
          input_text: undefined,
        };

        const result = triggerGenerationSchema.safeParse(invalidRequest);
        expect(result.success).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should count whitespace characters in length', () => {
        const textWithSpaces = ' '.repeat(1000);
        const validRequest = {
          input_text: textWithSpaces,
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should count newline characters in length', () => {
        const textWithNewlines = '\n'.repeat(1000);
        const validRequest = {
          input_text: textWithNewlines,
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should handle text exactly at boundaries (1001 chars)', () => {
        const validRequest = {
          input_text: 'A'.repeat(1001),
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });

      it('should handle text exactly at boundaries (9999 chars)', () => {
        const validRequest = {
          input_text: 'A'.repeat(9999),
        };

        const result = triggerGenerationSchema.safeParse(validRequest);
        expect(result.success).toBe(true);
      });
    });
  });
});
