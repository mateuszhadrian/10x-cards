import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
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
 * @param context - Astro context with headers, cookies and runtime env
 */
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  env?: { SUPABASE_URL: string; SUPABASE_KEY: string };
}) => {
  // Get env variables from context.env (Cloudflare Pages runtime) or fallback to import.meta.env (build time)
  const supabaseUrl = context.env?.SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseKey = context.env?.SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
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

export type SupabaseClient = ReturnType<typeof createSupabaseServerInstance>;

export const DEFAULT_USER_ID = "4f826be5-455b-49d7-ac43-c890f6ebdd18";
