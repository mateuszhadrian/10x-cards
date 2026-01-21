import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { loginSchema } from "@/lib/validations/auth.validation";

/**
 * Login API endpoint
 *
 * Handles user authentication using Supabase Auth
 * Accepts email and password, validates them, and creates a session
 * Cookies are automatically set by @supabase/ssr
 *
 * @route POST /api/auth/login
 * @access Public
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    // Parse and validate request body
    const body = await request.json();

    // Validate input using zod schema
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { email, password } = validationResult.data;

    // Get runtime env from Cloudflare Pages
    const runtime = locals.runtime as { env: { SUPABASE_URL: string; SUPABASE_KEY: string } } | undefined;

    // Create Supabase server client with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      env: runtime?.env,
    });

    // Attempt to sign in with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return successful response with user data
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Login error:", error);

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during login",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Disable prerendering for this API route
export const prerender = false;
