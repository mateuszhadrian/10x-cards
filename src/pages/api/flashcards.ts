import type { APIRoute } from "astro";

import { createFlashcardsSchema, listFlashcardsQuerySchema } from "../../lib/validations/flashcards.validation";
import { createFlashcards, listFlashcards } from "../../lib/services/flashcards.service";
import type { CreateFlashcardsResponseDTO, ListFlashcardsResponseDTO } from "../../types";

/**
 * Disable prerendering for this API route to ensure it runs server-side.
 */
export const prerender = false;

/**
 * GET /api/flashcards
 *
 * Lists flashcards for the authenticated user with pagination and optional filters.
 *
 * Query Parameters:
 * - page: number (optional, default: 1) - Page number for pagination
 * - limit: number (optional, default: 10, max: 100) - Number of items per page
 * - is_deleted: boolean (optional) - Filter by deletion status
 * - search: string (optional) - Search flashcards by front text (case-insensitive)
 *
 * Response:
 * - 200 OK: List of flashcards with pagination metadata
 * - 400 Bad Request: Invalid query parameters
 * - 404 Not Found: No flashcards found for the user
 * - 500 Internal Server Error: Server error or database failure
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse query parameters from URL
    const searchParams = Object.fromEntries(url.searchParams.entries());

    // Validate query parameters using Zod schema
    const validationResult = listFlashcardsQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
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

    const { page, limit, is_deleted, search } = validationResult.data;

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

    // Call flashcards service to list flashcards
    const result = await listFlashcards(supabase, user.id, {
      page,
      limit,
      is_deleted,
      search,
    });

    // Check if no flashcards were found
    if (result.total === 0) {
      return new Response(
        JSON.stringify({
          error: "No flashcards found",
          message: "You don't have any flashcards yet. Create some to get started!",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return successful response with flashcards and pagination metadata
    const response: ListFlashcardsResponseDTO = {
      flashcards: result.flashcards,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error in GET /api/flashcards:", error);

    // Check if it's a known error with a message
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

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

    // Call flashcards service to create the flashcards
    const result = await createFlashcards(supabase, user.id, flashcards);

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
