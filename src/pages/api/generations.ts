import type { APIRoute } from "astro";

import { triggerGenerationSchema } from "../../lib/validations/generations.validation";
import { initiateGeneration } from "../../lib/services/generations.service";
import type { GenerationResponseDTO } from "../../types";

/**
 * Disable prerendering for this API route to ensure it runs server-side.
 */
export const prerender = false;

/**
 * POST /api/generations
 *
 * Initiates the AI flashcard generation process based on the provided input text.
 *
 * Request Body:
 * - input_text: string (1000-10000 characters)
 *
 * Response:
 * - 201 Created: Generation initiated successfully with flashcard proposals
 * - 400 Bad Request: Invalid input data
 * - 500 Internal Server Error: Server error or AI service failure
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = triggerGenerationSchema.safeParse(body);

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

    const { input_text } = validationResult.data;

    // Get Supabase client and user from context
    const supabase = locals.supabase;
    const user = locals.user;

    // Get runtime env from Cloudflare Pages
    const runtime = locals.runtime as
      | { env: { OPENROUTER_API_KEY: string } }
      | undefined;

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

    // Get OpenRouter API key from runtime env or fallback to import.meta.env
    const openrouterApiKey = runtime?.env.OPENROUTER_API_KEY || import.meta.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenRouter API key not configured",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call generation service to initiate the generation process
    const result = await initiateGeneration(supabase, user.id, input_text, openrouterApiKey);

    // Return successful response with generation data and flashcard proposals
    const response: GenerationResponseDTO = {
      message: "Generation initiated",
      generation: result.generation,
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
    console.error("Error in POST /api/generations:", error);

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
