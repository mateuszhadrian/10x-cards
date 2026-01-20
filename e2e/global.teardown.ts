/**
 * Global Teardown for Playwright Tests
 *
 * This runs once after all tests complete to clean up test data from the database.
 *
 * Responsibilities:
 * 1. Connect to Supabase as test user
 * 2. Delete all flashcards created during tests
 * 3. Delete all generations created during tests
 * 4. Delete all generation errors created during tests
 *
 * This ensures:
 * - Clean state for next test run
 * - No accumulation of test data in database
 * - Tests remain idempotent
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Helper function to cleanup a table with retry logic
 * Retries up to maxRetries times with exponential backoff
 */
async function cleanupTableWithRetry(supabase: SupabaseClient, table: string, userId: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.from(table).delete().eq("user_id", userId).select();

      if (error) {
        throw error;
      }

      const count = data?.length || 0;
      console.log(`✓ Deleted ${count} ${table} record(s)`);
      return count;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      if (isLastAttempt) {
        console.error(`❌ Failed to delete ${table} after ${maxRetries} attempts:`, error);
        throw error;
      }

      const waitTime = 1000 * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
      console.log(`⚠️  Retry ${attempt + 1}/${maxRetries} for ${table} cleanup in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return 0;
}

async function globalTeardown() {
  console.log("\n🧹 Starting global teardown - cleaning test data...\n");

  // Get credentials from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Warning: SUPABASE_URL or SUPABASE_PUBLIC_KEY not set, skipping teardown");
    return;
  }

  if (!testUserId) {
    console.warn("⚠️  Warning: E2E_USERNAME_ID not set, skipping teardown");
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate as test user to bypass RLS
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      console.warn("⚠️  Warning: E2E credentials not set, skipping teardown");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("❌ Failed to authenticate for teardown:", authError.message);
      return;
    }

    console.log("✓ Authenticated as test user");

    // Clean up flashcards (will cascade delete via foreign keys if needed)
    try {
      await cleanupTableWithRetry(supabase, "flashcards", testUserId);
    } catch {
      // Continue even if this fails - we want to try cleaning other tables
      console.warn("⚠️  Flashcards cleanup failed, continuing with other tables...");
    }

    // Clean up generations (will cascade delete generation_errors via foreign key)
    try {
      await cleanupTableWithRetry(supabase, "generations", testUserId);
    } catch {
      // Continue even if this fails
      console.warn("⚠️  Generations cleanup failed, continuing...");
    }

    // Clean up generation errors (if not cascade deleted)
    // Note: generations_errors doesn't have user_id, so we need to use a custom query
    try {
      const { data, error } = await supabase
        .from("generations_errors")
        .delete()
        .in("generation_id", supabase.from("generations").select("id").eq("user_id", testUserId))
        .select();

      if (error) {
        throw error;
      }

      const count = data?.length || 0;
      console.log(`✓ Deleted ${count} generations_errors record(s)`);
    } catch {
      // This is expected to fail if table doesn't exist or already cascade deleted
      console.log("ℹ️  Generation errors cleanup skipped (likely cascade deleted or table does not exist)");
    }

    // Sign out
    await supabase.auth.signOut();
    console.log("✓ Signed out test user");

    console.log("\n✅ Global teardown completed successfully\n");
  } catch (error) {
    console.error("❌ Global teardown failed:", error);
    // Don't throw - we don't want to fail the entire test run on teardown errors
  }
}

export default globalTeardown;
