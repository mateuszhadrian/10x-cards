import type { APIRoute } from "astro";

import { deleteFlashcardParamsSchema } from "../../../lib/validations/flashcards.validation";
import { deleteFlashcard } from "../../../lib/services/flashcards.service";

/**
 * Disable prerendering for this API route to ensure it runs server-side.
 */
export const prerender = false;

/**
 * DELETE /api/flashcards/:id
 *
 * Deletes a flashcard by marking it as deleted (soft delete).
 * Only the owner of the flashcard can delete it.
 *
 * URL Parameters:
 * - id: number - ID of the flashcard to delete
 *
 * Response:
 * - 200 OK: Flashcard deleted successfully
 * - 400 Bad Request: Invalid ID parameter or flashcard already deleted
 * - 404 Not Found: Flashcard not found or doesn't belong to the user
 * - 500 Internal Server Error: Server error or database failure
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // Validate ID parameter from URL path
    const validationResult = deleteFlashcardParamsSchema.safeParse({ id: params.id });

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid ID parameter",
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

    const { id } = validationResult.data;

    // Get Supabase client and user from context
    const supabase = locals.supabase;
    const user = locals.user;

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

    if (!user) {
      return new Response(
        JSON.stringify({
          error: "User not authenticated",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call flashcards service to delete the flashcard
    await deleteFlashcard(supabase, user.id, id);

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Flashcard deleted successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error in DELETE /api/flashcards/:id:", error);

    // Check if it's a known error with a message
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    // Return appropriate status code based on error type
    let status = 500;
    if (errorMessage.includes("not found")) {
      status = 404;
    } else if (errorMessage.includes("already deleted")) {
      status = 400;
    }

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
