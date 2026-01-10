-- =====================================================
-- Migration: Temporarily disable RLS policies
-- Purpose: Drop all RLS policies for development/testing
-- Affected Tables: generations, flashcards, generations_errors
-- Special Considerations:
--   - RLS remains enabled on tables (only policies are dropped)
--   - Tables will be accessible without restrictions during development
--   - A future migration will re-enable these policies
-- =====================================================

-- =====================================================
-- Drop policies from generations table
-- =====================================================

-- drop all policies from generations table
drop policy if exists "authenticated_select_own_generations" on public.generations;
drop policy if exists "authenticated_insert_own_generations" on public.generations;
drop policy if exists "authenticated_update_own_generations" on public.generations;
drop policy if exists "authenticated_delete_own_generations" on public.generations;

-- =====================================================
-- Drop policies from flashcards table
-- =====================================================

-- drop all policies from flashcards table
drop policy if exists "authenticated_select_own_flashcards" on public.flashcards;
drop policy if exists "authenticated_insert_own_flashcards" on public.flashcards;
drop policy if exists "authenticated_update_own_flashcards" on public.flashcards;
drop policy if exists "authenticated_delete_own_flashcards" on public.flashcards;

-- =====================================================
-- Drop policies from generations_errors table
-- =====================================================

-- drop all policies from generations_errors table
drop policy if exists "authenticated_select_own_generation_errors" on public.generations_errors;
drop policy if exists "authenticated_insert_own_generation_errors" on public.generations_errors;
drop policy if exists "authenticated_update_own_generation_errors" on public.generations_errors;
drop policy if exists "authenticated_delete_own_generation_errors" on public.generations_errors;

-- note: RLS is still enabled on all tables but no policies are active
-- this means tables are accessible without restrictions during development
-- run a future migration to re-enable policies when ready for production

