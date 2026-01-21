import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

/**
 * Logout API endpoint
 *
 * Handles user logout by signing out from Supabase
 * Cookies are automatically cleared by @supabase/ssr
 *
 * @route POST /api/auth/logout
 * @access Public (but only makes sense for authenticated users)
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    // Get runtime env from Cloudflare Pages
    const runtime = locals.runtime as
      | { env: { SUPABASE_URL: string; SUPABASE_KEY: string } }
      | undefined;

    // Create Supabase server client with cookie handling
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
      env: runtime?.env,
    });

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    // Handle logout errors
    if (error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Logged out successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle unexpected errors
    // eslint-disable-next-line no-console
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred during logout",
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
