-- =====================================================
-- Migration: Create flashcards table
-- Purpose: Store flashcard data with front/back content
-- Affected Tables: flashcards
-- Special Considerations:
--   - user_id references auth.users (Supabase Auth)
--   - generation_id is optional (manual cards don't have generation_id)
--   - source tracks origin: ai-full, ai-edited, or manual
--   - soft delete via is_deleted flag
--   - RLS enabled to ensure users only access their own flashcards
-- =====================================================

-- create flashcards table to store user flashcard content
create table public.flashcards (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  front varchar(200) not null,
  back varchar(500) not null,
  source varchar(255),
  generation_id bigint references public.generations(id) on delete set null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone,
  is_deleted boolean not null default false,
  
  -- ensure front content has valid length (1-200 characters)
  constraint check_front_length 
    check (length(front) between 1 and 200),
  
  -- ensure back content has valid length (1-500 characters)
  constraint check_back_length 
    check (length(back) between 1 and 500),
  
  -- ensure source is one of the allowed values
  constraint check_source_value 
    check (source in ('ai-full', 'ai-edited', 'manual'))
);

-- create index on user_id for efficient filtering by user
create index idx_flashcards_user_id on public.flashcards(user_id);

-- create index on generation_id for efficient lookup of flashcards by generation
create index idx_flashcards_generation_id on public.flashcards(generation_id);

-- create index on is_deleted for efficient filtering of active flashcards
create index idx_flashcards_is_deleted on public.flashcards(is_deleted);

-- create composite index for user's active flashcards (most common query)
create index idx_flashcards_user_active on public.flashcards(user_id, is_deleted);

-- create index on created_at for chronological queries
create index idx_flashcards_created_at on public.flashcards(created_at desc);

-- enable row level security on flashcards table
alter table public.flashcards enable row level security;

-- =====================================================
-- RLS Policies for flashcards table (TEMPORARILY DISABLED)
-- These policies ensure users can only access their own flashcards
-- TODO: Uncomment these policies when ready to enable RLS
-- =====================================================

-- -- policy: allow authenticated users to select their own flashcards
-- create policy "authenticated_select_own_flashcards"
--   on public.flashcards
--   for select
--   to authenticated
--   using (auth.uid() = user_id);

-- -- policy: allow authenticated users to insert their own flashcards
-- create policy "authenticated_insert_own_flashcards"
--   on public.flashcards
--   for insert
--   to authenticated
--   with check (auth.uid() = user_id);

-- -- policy: allow authenticated users to update their own flashcards
-- create policy "authenticated_update_own_flashcards"
--   on public.flashcards
--   for update
--   to authenticated
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);

-- -- policy: allow authenticated users to delete their own flashcards
-- -- note: this is hard delete, soft delete is handled via is_deleted column
-- create policy "authenticated_delete_own_flashcards"
--   on public.flashcards
--   for delete
--   to authenticated
--   using (auth.uid() = user_id);

-- comment on table and columns for documentation
comment on table public.flashcards is 'Stores flashcard content with front/back text';
comment on column public.flashcards.front is 'Front side of flashcard (1-200 characters)';
comment on column public.flashcards.back is 'Back side of flashcard (1-500 characters)';
comment on column public.flashcards.source is 'Origin of flashcard: ai-full, ai-edited, or manual';
comment on column public.flashcards.generation_id is 'Optional reference to generation batch (null for manual cards)';
comment on column public.flashcards.is_deleted is 'Soft delete flag for flashcard';

