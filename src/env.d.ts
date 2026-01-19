/// <reference types="astro/client" />

import type { SupabaseClient } from "./db/supabase.client.ts";

/**
 * User session information stored in Astro.locals
 * Available in all Astro pages and API routes after middleware processing
 */
export interface UserSession {
  id: string;
  email?: string;
}

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user: UserSession | null;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
