import { z } from "zod";

/**
 * Validation schema for a single flashcard creation.
 * Validates front, back, source, and generation_id fields.
 */
export const flashcardSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front text must be at least 1 character long")
      .max(200, "Front text must not exceed 200 characters"),
    back: z
      .string()
      .min(1, "Back text must be at least 1 character long")
      .max(500, "Back text must not exceed 500 characters"),
    source: z.enum(["manual", "ai-full", "ai-edited"], {
      errorMap: () => ({ message: "Source must be one of: manual, ai-full, ai-edited" }),
    }),
    generation_id: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      // If source is ai-full or ai-edited, generation_id must be provided
      if (data.source === "ai-full" || data.source === "ai-edited") {
        return data.generation_id !== null;
      }
      return true;
    },
    {
      message: "generation_id is required when source is ai-full or ai-edited",
      path: ["generation_id"],
    }
  );

/**
 * Validation schema for creating multiple flashcards.
 * Enforces that at least one flashcard is provided and no more than 30.
 */
export const createFlashcardsSchema = z.object({
  flashcards: z
    .array(flashcardSchema)
    .min(1, "At least one flashcard must be provided")
    .max(30, "Cannot create more than 30 flashcards at once"),
});

export type CreateFlashcardsInput = z.infer<typeof createFlashcardsSchema>;
export type FlashcardInput = z.infer<typeof flashcardSchema>;

/**
 * Validation schema for listing flashcards with pagination and filters.
 * Supports page, limit, is_deleted filter, and search by front text.
 */
export const listFlashcardsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100).default(10)),
  is_deleted: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") return undefined;
      return val === "true";
    }),
  search: z.string().optional(),
});

export type ListFlashcardsQuery = z.infer<typeof listFlashcardsQuerySchema>;

/**
 * Validation schema for deleting a flashcard by ID.
 * Validates that the ID parameter is a valid positive integer.
 */
export const deleteFlashcardParamsSchema = z.object({
  id: z
    .string()
    .min(1, "ID parameter is required")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive("ID must be a positive integer")),
});

export type DeleteFlashcardParams = z.infer<typeof deleteFlashcardParamsSchema>;
