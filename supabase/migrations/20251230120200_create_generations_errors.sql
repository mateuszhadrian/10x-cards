-- =====================================================
-- Migration: Create generations_errors table
-- Purpose: Track errors that occur during AI flashcard generation
-- Affected Tables: generations_errors
-- Special Considerations:
--   - generation_id references generations table
--   - cascades on delete to clean up errors when generation is deleted
--   - RLS enabled but policies allow viewing errors for own generations
-- =====================================================

-- create generations_errors table to log errors during generation
create table public.generations_errors (
  id serial primary key,
  generation_id bigint not null references public.generations(id) on delete cascade,
  error_message text not null,
  model varchar(100),
  created_at timestamp with time zone not null default now()
);

-- create index on generation_id for efficient lookup of errors by generation
create index idx_generations_errors_generation_id on public.generations_errors(generation_id);

-- create index on created_at for chronological queries
create index idx_generations_errors_created_at on public.generations_errors(created_at desc);

-- enable row level security on generations_errors table
alter table public.generations_errors enable row level security;

-- =====================================================
-- RLS Policies for generations_errors table (TEMPORARILY DISABLED)
-- These policies ensure users can only access errors for their own generations
-- Strategy: Join with generations table to check ownership via user_id
-- TODO: Uncomment these policies when ready to enable RLS
-- =====================================================

-- -- policy: allow authenticated users to select errors for their own generations
-- create policy "authenticated_select_own_generation_errors"
--   on public.generations_errors
--   for select
--   to authenticated
--   using (
--     exists (
--       select 1 
--       from public.generations 
--       where generations.id = generations_errors.generation_id 
--         and generations.user_id = auth.uid()
--     )
--   );

-- -- policy: allow authenticated users to insert errors for their own generations
-- -- note: this is typically done by backend/api, not directly by users
-- create policy "authenticated_insert_own_generation_errors"
--   on public.generations_errors
--   for insert
--   to authenticated
--   with check (
--     exists (
--       select 1 
--       from public.generations 
--       where generations.id = generations_errors.generation_id 
--         and generations.user_id = auth.uid()
--     )
--   );

-- -- policy: allow authenticated users to update errors for their own generations
-- -- note: updates are rare, but included for completeness
-- create policy "authenticated_update_own_generation_errors"
--   on public.generations_errors
--   for update
--   to authenticated
--   using (
--     exists (
--       select 1 
--       from public.generations 
--       where generations.id = generations_errors.generation_id 
--         and generations.user_id = auth.uid()
--     )
--   )
--   with check (
--     exists (
--       select 1 
--       from public.generations 
--       where generations.id = generations_errors.generation_id 
--         and generations.user_id = auth.uid()
--     )
--   );

-- -- policy: allow authenticated users to delete errors for their own generations
-- create policy "authenticated_delete_own_generation_errors"
--   on public.generations_errors
--   for delete
--   to authenticated
--   using (
--     exists (
--       select 1 
--       from public.generations 
--       where generations.id = generations_errors.generation_id 
--         and generations.user_id = auth.uid()
--     )
--   );

-- comment on table and columns for documentation
comment on table public.generations_errors is 'Logs errors that occur during AI flashcard generation';
comment on column public.generations_errors.generation_id is 'Reference to the generation session that encountered the error';
comment on column public.generations_errors.error_message is 'Detailed error message for debugging';
comment on column public.generations_errors.model is 'AI model identifier that encountered the error';

