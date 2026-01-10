-- =====================================================
-- Migration: Create generations table
-- Purpose: Store AI generation metadata for flashcard batches
-- Affected Tables: generations
-- Special Considerations:
--   - user_id references auth.users (Supabase Auth)
--   - source_text_hash stores SHA-256 hash for duplicate detection
--   - RLS enabled to ensure users only access their own generations
-- =====================================================

-- create generations table to track ai flashcard generation sessions
create table public.generations (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_text_hash varchar(64),
  source_text_length integer not null,
  generation_duration integer not null,
  model varchar(100),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone,
  
  -- ensure source text length is within acceptable range (1000-10000 characters)
  constraint check_source_text_length 
    check (source_text_length between 1000 and 10000)
);

-- create index on user_id for efficient filtering by user
create index idx_generations_user_id on public.generations(user_id);

-- create index on source_text_hash for duplicate detection
create index idx_generations_source_text_hash on public.generations(source_text_hash);

-- create index on created_at for chronological queries
create index idx_generations_created_at on public.generations(created_at desc);

-- enable row level security on generations table
alter table public.generations enable row level security;

-- =====================================================
-- RLS Policies for generations table (TEMPORARILY DISABLED)
-- These policies ensure users can only access their own generation records
-- TODO: Uncomment these policies when ready to enable RLS
-- =====================================================

-- -- policy: allow authenticated users to select their own generations
-- create policy "authenticated_select_own_generations"
--   on public.generations
--   for select
--   to authenticated
--   using (auth.uid() = user_id);

-- -- policy: allow authenticated users to insert their own generations
-- create policy "authenticated_insert_own_generations"
--   on public.generations
--   for insert
--   to authenticated
--   with check (auth.uid() = user_id);

-- -- policy: allow authenticated users to update their own generations
-- create policy "authenticated_update_own_generations"
--   on public.generations
--   for update
--   to authenticated
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

-- -- policy: allow authenticated users to delete their own generations
-- -- note: this will cascade delete to related flashcards and errors
-- create policy "authenticated_delete_own_generations"
--   on public.generations
--   for delete
--   to authenticated
--   using (auth.uid() = user_id);

-- comment on table and columns for documentation
comment on table public.generations is 'Stores metadata about AI flashcard generation sessions';
comment on column public.generations.source_text_hash is 'SHA-256 hash of source text for duplicate detection';
comment on column public.generations.source_text_length is 'Character count of source text (1000-10000)';
comment on column public.generations.generation_duration is 'Time taken to generate flashcards in milliseconds';
comment on column public.generations.model is 'AI model identifier used for generation';

