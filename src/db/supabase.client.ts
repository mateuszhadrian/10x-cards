import { createBrowserClient, createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "./database.types";

/**
 * Cookie options for Supabase auth
 * Ensures secure, httpOnly cookies with proper SameSite policy
 */
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

/**
 * Parse cookie header into array of cookie objects
 * Required by @supabase/ssr for getAll() implementation
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Create Supabase server client instance
 * Used in middleware and API routes for SSR
 * @param context - Astro context with headers and cookies
 */
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptionsWithName }[]) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });
};

/**
 * Create Supabase browser client instance
 * Used in React components for client-side operations
 * WARNING: Do not use this for authentication operations!
 * Auth should go through API endpoints to ensure proper cookie handling
 */
export const createSupabaseBrowserClient = () => {
  return createBrowserClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);
};

// Legacy export for backward compatibility
// TODO: Remove after migrating all usages to new server/browser clients
export const supabaseClient = createBrowserClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;

export const DEFAULT_USER_ID = "4f826be5-455b-49d7-ac43-c890f6ebdd18";
