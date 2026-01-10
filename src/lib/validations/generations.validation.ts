import { z } from "zod";

/**
 * Validation schema for triggering a new generation.
 * Enforces that input_text is between 1000 and 10000 characters.
 */
export const triggerGenerationSchema = z.object({
  input_text: z
    .string()
    .min(1000, "Input text must be at least 1000 characters long")
    .max(10000, "Input text must not exceed 10000 characters"),
});

export type TriggerGenerationInput = z.infer<typeof triggerGenerationSchema>;
