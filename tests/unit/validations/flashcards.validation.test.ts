/**
 * Unit Tests - Flashcards Validation Schemas
 *
 * Tests validation logic for flashcard creation, listing, and deletion.
 * Priority 1: Critical business logic that protects data integrity.
 */

import { describe, it, expect } from "vitest";
import {
  flashcardSchema,
  createFlashcardsSchema,
  listFlashcardsQuerySchema,
  deleteFlashcardParamsSchema,
} from "@/lib/validations/flashcards.validation";

describe("Flashcards Validation", () => {
  describe("flashcardSchema", () => {
    describe("valid flashcards", () => {
      it("should accept valid manual flashcard", () => {
        const validManualFlashcard = {
          front: "What is React?",
          back: "A JavaScript library for building user interfaces",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(validManualFlashcard);
        expect(result.success).toBe(true);
      });

      it("should accept valid AI flashcard with generation_id", () => {
        const validAIFlashcard = {
          front: "What is TypeScript?",
          back: "A typed superset of JavaScript",
          source: "ai-full" as const,
          generation_id: 123,
        };

        const result = flashcardSchema.safeParse(validAIFlashcard);
        expect(result.success).toBe(true);
      });

      it("should accept ai-edited flashcard with generation_id", () => {
        const validEditedFlashcard = {
          front: "What is Astro?",
          back: "A modern static site generator",
          source: "ai-edited" as const,
          generation_id: 456,
        };

        const result = flashcardSchema.safeParse(validEditedFlashcard);
        expect(result.success).toBe(true);
      });

      it("should accept minimum length text (1 character)", () => {
        const minLengthFlashcard = {
          front: "Q",
          back: "A",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(minLengthFlashcard);
        expect(result.success).toBe(true);
      });

      it("should accept maximum length front text (200 characters)", () => {
        const maxFrontFlashcard = {
          front: "A".repeat(200),
          back: "Answer",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(maxFrontFlashcard);
        expect(result.success).toBe(true);
      });

      it("should accept maximum length back text (500 characters)", () => {
        const maxBackFlashcard = {
          front: "Question",
          back: "A".repeat(500),
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(maxBackFlashcard);
        expect(result.success).toBe(true);
      });
    });

    describe("invalid flashcards", () => {
      it("should reject empty front text", () => {
        const invalidFlashcard = {
          front: "",
          back: "Answer",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("at least 1 character");
        }
      });

      it("should reject empty back text", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("at least 1 character");
        }
      });

      it("should reject front text exceeding 200 characters", () => {
        const invalidFlashcard = {
          front: "A".repeat(201),
          back: "Answer",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("must not exceed 200 characters");
        }
      });

      it("should reject back text exceeding 500 characters", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "A".repeat(501),
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("must not exceed 500 characters");
        }
      });

      it("should reject AI flashcard without generation_id", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "Answer",
          source: "ai-full" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("generation_id is required");
        }
      });

      it("should reject ai-edited flashcard without generation_id", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "Answer",
          source: "ai-edited" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("generation_id is required");
        }
      });

      it("should reject invalid source value", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "Answer",
          source: "invalid-source",
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Source must be one of");
        }
      });

      it("should accept null generation_id for manual flashcards", () => {
        const validFlashcard = {
          front: "Question",
          back: "Answer",
          source: "manual" as const,
          generation_id: null,
        };

        const result = flashcardSchema.safeParse(validFlashcard);
        expect(result.success).toBe(true);
      });

      it("should reject negative generation_id", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "Answer",
          source: "ai-full" as const,
          generation_id: -1,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
      });

      it("should reject non-integer generation_id", () => {
        const invalidFlashcard = {
          front: "Question",
          back: "Answer",
          source: "ai-full" as const,
          generation_id: 3.14,
        };

        const result = flashcardSchema.safeParse(invalidFlashcard);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("createFlashcardsSchema", () => {
    it("should accept array with 1 flashcard", () => {
      const validRequest = {
        flashcards: [
          {
            front: "Question",
            back: "Answer",
            source: "manual" as const,
            generation_id: null,
          },
        ],
      };

      const result = createFlashcardsSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should accept array with 30 flashcards (maximum)", () => {
      const flashcards = Array.from({ length: 30 }, (_, i) => ({
        front: `Question ${i + 1}`,
        back: `Answer ${i + 1}`,
        source: "manual" as const,
        generation_id: null,
      }));

      const validRequest = { flashcards };
      const result = createFlashcardsSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it("should reject empty array", () => {
      const invalidRequest = {
        flashcards: [],
      };

      const result = createFlashcardsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("At least one flashcard");
      }
    });

    it("should reject array with more than 30 flashcards", () => {
      const flashcards = Array.from({ length: 31 }, (_, i) => ({
        front: `Question ${i + 1}`,
        back: `Answer ${i + 1}`,
        source: "manual" as const,
        generation_id: null,
      }));

      const invalidRequest = { flashcards };
      const result = createFlashcardsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Cannot create more than 30");
      }
    });

    it("should reject if any flashcard in array is invalid", () => {
      const invalidRequest = {
        flashcards: [
          {
            front: "Valid Question",
            back: "Valid Answer",
            source: "manual" as const,
            generation_id: null,
          },
          {
            front: "", // Invalid - empty front
            back: "Answer",
            source: "manual" as const,
            generation_id: null,
          },
        ],
      };

      const result = createFlashcardsSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe("listFlashcardsQuerySchema", () => {
    it("should parse valid pagination parameters", () => {
      const query = {
        page: "2",
        limit: "20",
      };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it("should apply default values for missing parameters", () => {
      const query = {};

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
      }
    });

    it("should clamp limit to maximum of 100", () => {
      const query = {
        limit: "150",
      };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("should clamp limit to minimum of 1", () => {
      const query = {
        limit: "0",
      };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("should parse is_deleted boolean from string", () => {
      const queryTrue = { is_deleted: "true" };
      const queryFalse = { is_deleted: "false" };

      const resultTrue = listFlashcardsQuerySchema.safeParse(queryTrue);
      const resultFalse = listFlashcardsQuerySchema.safeParse(queryFalse);

      expect(resultTrue.success).toBe(true);
      expect(resultFalse.success).toBe(true);
      if (resultTrue.success) {
        expect(resultTrue.data.is_deleted).toBe(true);
      }
      if (resultFalse.success) {
        expect(resultFalse.data.is_deleted).toBe(false);
      }
    });

    it("should handle empty is_deleted string as undefined", () => {
      const query = { is_deleted: "" };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_deleted).toBeUndefined();
      }
    });

    it("should accept optional search parameter", () => {
      const query = { search: "React" };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe("React");
      }
    });

    it("should reject negative page number", () => {
      const query = { page: "-1" };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });

    it("should reject zero page number", () => {
      const query = { page: "0" };

      const result = listFlashcardsQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe("deleteFlashcardParamsSchema", () => {
    it("should parse valid ID parameter", () => {
      const params = { id: "123" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
      }
    });

    it("should reject empty ID parameter", () => {
      const params = { id: "" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("required");
      }
    });

    it("should reject negative ID", () => {
      const params = { id: "-1" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("positive integer");
      }
    });

    it("should reject zero ID", () => {
      const params = { id: "0" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("positive integer");
      }
    });

    it("should reject non-numeric ID", () => {
      const params = { id: "abc" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it("should convert decimal ID to integer (parseInt behavior)", () => {
      const params = { id: "12.5" };

      const result = deleteFlashcardParamsSchema.safeParse(params);
      // Note: parseInt('12.5', 10) returns 12, which is a valid positive integer
      // This is expected behavior of the schema
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(12);
      }
    });
  });
});
