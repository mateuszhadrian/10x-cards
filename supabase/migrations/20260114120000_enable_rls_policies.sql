-- =====================================================
-- Migration: Enable RLS policies
-- Purpose: Create and enable Row Level Security policies for all tables
-- Affected Tables: generations, flashcards, generations_errors
-- Special Considerations:
--   - Ensures users can only access their own data
--   - Policies are granular: separate policies for select, insert, update, delete
--   - Each policy is specific to the authenticated role
--   - generations_errors uses a join to verify ownership through generations table
-- =====================================================

-- =====================================================
-- RLS Policies for generations table
-- These policies ensure users can only access their own generation records
-- =====================================================

-- policy: allow authenticated users to select their own generations
create policy "authenticated_select_own_generations"
  on public.generations
  for select
  to authenticated
  using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own generations
create policy "authenticated_insert_own_generations"
  on public.generations
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- policy: allow authenticated users to update their own generations
create policy "authenticated_update_own_generations"
  on public.generations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- policy: allow authenticated users to delete their own generations
-- note: this will cascade delete to related flashcards and errors
create policy "authenticated_delete_own_generations"
  on public.generations
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for flashcards table
-- These policies ensure users can only access their own flashcards
-- =====================================================

-- policy: allow authenticated users to select their own flashcards
create policy "authenticated_select_own_flashcards"
  on public.flashcards
  for select
  to authenticated
  using (auth.uid() = user_id);

-- policy: allow authenticated users to insert their own flashcards
create policy "authenticated_insert_own_flashcards"
  on public.flashcards
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- policy: allow authenticated users to update their own flashcards
create policy "authenticated_update_own_flashcards"
  on public.flashcards
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- policy: allow authenticated users to delete their own flashcards
-- note: this is hard delete, soft delete is handled via is_deleted column
create policy "authenticated_delete_own_flashcards"
  on public.flashcards
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for generations_errors table
-- These policies ensure users can only access errors for their own generations
-- Strategy: Join with generations table to check ownership via user_id
-- =====================================================

-- policy: allow authenticated users to select errors for their own generations
create policy "authenticated_select_own_generation_errors"
  on public.generations_errors
  for select
  to authenticated
  using (
    exists (
      select 1 
      from public.generations 
      where generations.id = generations_errors.generation_id 
        and generations.user_id = auth.uid()
    )
  );

-- policy: allow authenticated users to insert errors for their own generations
-- note: this is typically done by backend/api, not directly by users
create policy "authenticated_insert_own_generation_errors"
  on public.generations_errors
  for insert
  to authenticated
  with check (
    exists (
      select 1 
      from public.generations 
      where generations.id = generations_errors.generation_id 
        and generations.user_id = auth.uid()
    )
  );

-- policy: allow authenticated users to update errors for their own generations
-- note: updates are rare, but included for completeness
create policy "authenticated_update_own_generation_errors"
  on public.generations_errors
  for update
  to authenticated
  using (
    exists (
      select 1 
      from public.generations 
      where generations.id = generations_errors.generation_id 
        and generations.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 
      from public.generations 
      where generations.id = generations_errors.generation_id 
        and generations.user_id = auth.uid()
    )
  );

-- policy: allow authenticated users to delete errors for their own generations
create policy "authenticated_delete_own_generation_errors"
  on public.generations_errors
  for delete
  to authenticated
  using (
    exists (
      select 1 
      from public.generations 
      where generations.id = generations_errors.generation_id 
        and generations.user_id = auth.uid()
    )
  );
