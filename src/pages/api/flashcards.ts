import type { APIRoute } from "astro";

import { createFlashcardsSchema } from "../../lib/validations/flashcards.validation";
import { createFlashcards } from "../../lib/services/flashcards.service";
import type { CreateFlashcardsResponseDTO } from "../../types";

/**
 * Disable prerendering for this API route to ensure it runs server-side.
 */
export const prerender = false;

/**
 * POST /api/flashcards
 *
 * Creates flashcards based on the provided data.
 * Supports both manual creation and AI-generated flashcards (with generation_id).
 *
 * Request Body:
 * - flashcards: Array of flashcard objects
 *   - front: string (1-200 characters)
 *   - back: string (1-500 characters)
 *   - source: "manual" | "ai-full" | "ai-edited"
 *   - generation_id: number | null (required for ai-full and ai-edited)
 *
 * Response:
 * - 201 Created: Flashcards created successfully
 * - 400 Bad Request: Invalid input data or validation errors
 * - 500 Internal Server Error: Server error or database failure
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { flashcards } = validationResult.data;

    // Get Supabase client from context
    const supabase = locals.supabase;

    if (!supabase) {
      return new Response(
        JSON.stringify({
          error: "Database connection not available",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call flashcards service to create the flashcards
    const result = await createFlashcards(supabase, flashcards);

    // Return successful response with created flashcards
    const response: CreateFlashcardsResponseDTO = {
      message: "Flashcards saved successfully",
      flashcards: result.flashcards,
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/flashcards:", error);

    // Check if it's a known error with a message
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    // Return appropriate status code based on error type
    const status = errorMessage.includes("not found") || errorMessage.includes("does not belong") ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
