import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/validations/auth.validation";

/**
 * Disable prerendering for this API route to ensure it runs server-side.
 */
export const prerender = false;

/**
 * POST /api/auth/register
 *
 * Registers a new user with Supabase Auth.
 *
 * Request Body:
 * - email: string (valid email format)
 * - password: string (min 6 characters)
 * - confirmPassword: string (must match password)
 *
 * Response:
 * - 201 Created: User registered successfully
 * - 400 Bad Request: Validation error
 * - 409 Conflict: User already exists
 * - 500 Internal Server Error: Server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = registerSchema.safeParse(body);

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

    const { email, password } = validationResult.data;

    // Get Supabase client from context
    const supabase = locals.supabase;

    if (!supabase) {
      return new Response(
        JSON.stringify({
          error: "Authentication service not available",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Email confirmation is disabled in local development
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    if (error) {
      // Check for specific error types
      if (error.message.includes("already registered")) {
        return new Response(
          JSON.stringify({
            error: "User already exists",
            message: "An account with this email already exists. Please sign in instead.",
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Registration successful",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Error in POST /api/auth/register:", error);

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
