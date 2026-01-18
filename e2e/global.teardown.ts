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

import { createClient } from '@supabase/supabase-js';

async function globalTeardown() {
  console.log('\n🧹 Starting global teardown - cleaning test data...\n');

  // Get credentials from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLIC_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Warning: SUPABASE_URL or SUPABASE_PUBLIC_KEY not set, skipping teardown');
    return;
  }

  if (!testUserId) {
    console.warn('⚠️  Warning: E2E_USERNAME_ID not set, skipping teardown');
    return;
  }

  try {
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate as test user to bypass RLS
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      console.warn('⚠️  Warning: E2E credentials not set, skipping teardown');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Failed to authenticate for teardown:', authError.message);
      return;
    }

    console.log('✓ Authenticated as test user');

    // Clean up flashcards (will cascade delete via foreign keys if needed)
    const { data: flashcardsData, error: flashcardsError } = await supabase
      .from('flashcards')
      .delete()
      .eq('user_id', testUserId)
      .select();

    if (flashcardsError) {
      console.error('❌ Failed to delete flashcards:', flashcardsError.message);
    } else {
      const count = flashcardsData?.length || 0;
      console.log(`✓ Deleted ${count} flashcard(s)`);
    }

    // Clean up generations (will cascade delete generation_errors via foreign key)
    const { data: generationsData, error: generationsError } = await supabase
      .from('generations')
      .delete()
      .eq('user_id', testUserId)
      .select();

    if (generationsError) {
      console.error('❌ Failed to delete generations:', generationsError.message);
    } else {
      const count = generationsData?.length || 0;
      console.log(`✓ Deleted ${count} generation(s)`);
    }

    // Clean up generation errors (if not cascade deleted)
    const { data: errorsData, error: errorsError } = await supabase
      .from('generations_errors')
      .delete()
      .eq('user_id', testUserId)
      .select();

    if (errorsError) {
      // Might fail if table doesn't exist or already cascade deleted
      console.log('ℹ️  Generation errors cleanup:', errorsError.message);
    } else {
      const count = errorsData?.length || 0;
      if (count > 0) {
        console.log(`✓ Deleted ${count} generation error(s)`);
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('✓ Signed out test user');

    console.log('\n✅ Global teardown completed successfully\n');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw - we don't want to fail the entire test run on teardown errors
  }
}

export default globalTeardown;
