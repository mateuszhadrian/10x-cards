import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

/**
 * Public paths that don't require authentication
 * - "/" - Welcome page
 * - "/login" - Login page
 * - "/register" - Registration page
 * - "/forgot-password" - Forgot password page
 * - "/reset-password" - Reset password page
 * - "/api/auth/login" - Login API endpoint
 * - "/api/auth/register" - Registration API endpoint
 * - "/api/auth/logout" - Logout API endpoint
 */
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

/**
 * Check if the given path is public (doesn't require authentication)
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * Authentication middleware
 *
 * Responsibilities:
 * 1. Create Supabase server client with cookie handling
 * 2. Refresh user session (handles token refresh automatically)
 * 3. Inject user and supabase into context.locals
 * 4. Protect routes - redirect to /login if not authenticated
 * 5. Redirect authenticated users away from /login to /generate
 */
export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Get runtime env from Cloudflare Pages
  const runtime = locals.runtime as
    | { env: { SUPABASE_URL: string; SUPABASE_KEY: string; OPENROUTER_API_KEY: string } }
    | undefined;

  // Create Supabase server client
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
    env: runtime?.env,
  });

  // IMPORTANT: Always get user session first
  // This also handles token refresh automatically
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Inject supabase and user into locals for use in pages and API routes
  locals.supabase = supabase;
  locals.user = user
    ? {
        id: user.id,
        email: user.email,
      }
    : null;

  // Special case: Redirect authenticated users away from login page
  if (user && url.pathname === "/login") {
    return redirect("/generate");
  }

  // Skip auth check for public paths
  if (isPublicPath(url.pathname)) {
    return next();
  }

  // Protect all other routes - redirect to login if not authenticated
  if (!user) {
    return redirect("/login");
  }

  return next();
});
