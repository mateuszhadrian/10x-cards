import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import type { FlashcardSource } from "../../types";

type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];

/**
 * Input for creating a single flashcard.
 */
export interface CreateFlashcardInput {
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number | null;
}

/**
 * Result of the flashcard creation process.
 */
export interface CreateFlashcardsResult {
  flashcards: FlashcardRow[];
}

/**
 * Verifies that a generation exists and belongs to the user.
 * This is important to ensure data integrity when creating AI-sourced flashcards.
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param generationId - The generation ID to verify
 * @returns True if the generation exists, throws an error otherwise
 * @throws Error if the generation doesn't exist
 */
async function verifyGenerationExists(supabase: SupabaseClient, userId: string, generationId: number): Promise<boolean> {
  const { data: generation, error } = await supabase
    .from("generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", userId)
    .single();

  if (error || !generation) {
    throw new Error(`Generation with id ${generationId} not found or does not belong to the user`);
  }

  return true;
}

/**
 * Creates multiple flashcards in a single transaction.
 *
 * This function:
 * 1. Validates that all AI-sourced flashcards reference existing generations
 * 2. Performs a bulk insert of all flashcards
 * 3. Returns the created flashcard records
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param flashcards - Array of flashcards to create
 * @returns Result containing the created flashcard records
 * @throws Error if validation fails or database operation fails
 */
export async function createFlashcards(
  supabase: SupabaseClient,
  userId: string,
  flashcards: CreateFlashcardInput[]
): Promise<CreateFlashcardsResult> {
  // Step 1: Validate all AI-sourced flashcards have valid generation_ids
  const uniqueGenerationIds = new Set<number>();

  for (const flashcard of flashcards) {
    if ((flashcard.source === "ai-full" || flashcard.source === "ai-edited") && flashcard.generation_id) {
      uniqueGenerationIds.add(flashcard.generation_id);
    }
  }

  // Verify each unique generation_id exists
  for (const generationId of uniqueGenerationIds) {
    await verifyGenerationExists(supabase, userId, generationId);
  }

  // Step 2: Prepare flashcard records for insertion
  const flashcardsToInsert: FlashcardInsert[] = flashcards.map((flashcard) => ({
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source,
    generation_id: flashcard.generation_id,
    user_id: userId,
  }));

  // Step 3: Perform bulk insert
  const { data: createdFlashcards, error: insertError } = await supabase
    .from("flashcards")
    .insert(flashcardsToInsert)
    .select();

  if (insertError || !createdFlashcards) {
    throw new Error(`Failed to create flashcards: ${insertError?.message || "Unknown error"}`);
  }

  // Step 4: Return the created flashcards
  return {
    flashcards: createdFlashcards,
  };
}

/**
 * Input parameters for listing flashcards.
 */
export interface ListFlashcardsInput {
  page: number;
  limit: number;
  is_deleted?: boolean;
  search?: string;
}

/**
 * Result of the list flashcards operation.
 */
export interface ListFlashcardsResult {
  flashcards: FlashcardRow[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists flashcards for the user with pagination and optional filters.
 *
 * This function:
 * 1. Builds a query with pagination (page, limit)
 * 2. Applies optional filters (is_deleted, search by front text)
 * 3. Returns flashcards and pagination metadata
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param params - Pagination and filter parameters
 * @returns Result containing flashcards and pagination metadata
 * @throws Error if database operation fails
 */
export async function listFlashcards(
  supabase: SupabaseClient,
  userId: string,
  params: ListFlashcardsInput
): Promise<ListFlashcardsResult> {
  const { page, limit, is_deleted, search } = params;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // Build the base query
  let query = supabase.from("flashcards").select("*", { count: "exact" }).eq("user_id", userId);

  // Apply is_deleted filter if provided
  if (is_deleted !== undefined) {
    query = query.eq("is_deleted", is_deleted);
  }

  // Apply search filter if provided (case-insensitive search in front field)
  if (search && search.trim() !== "") {
    query = query.ilike("front", `%${search.trim()}%`);
  }

  // Apply pagination and ordering
  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  // Execute query
  const { data: flashcards, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list flashcards: ${error.message}`);
  }

  // Return results with pagination metadata
  return {
    flashcards: flashcards || [],
    total: count || 0,
    page,
    limit,
  };
}

/**
 * Deletes a flashcard by marking it as deleted (soft delete).
 *
 * This function:
 * 1. Verifies the flashcard exists and belongs to the user
 * 2. Marks the flashcard as deleted (is_deleted = true)
 * 3. Returns success status
 *
 * @param supabase - Supabase client instance
 * @param userId - The ID of the authenticated user
 * @param id - ID of the flashcard to delete
 * @returns True if deletion was successful
 * @throws Error if flashcard not found or database operation fails
 */
export async function deleteFlashcard(supabase: SupabaseClient, userId: string, id: number): Promise<boolean> {
  // Step 1: Verify flashcard exists and belongs to the user
  const { data: existingFlashcard, error: fetchError } = await supabase
    .from("flashcards")
    .select("id, user_id, is_deleted")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingFlashcard) {
    throw new Error(`Flashcard with id ${id} not found`);
  }

  // Check if flashcard is already deleted
  if (existingFlashcard.is_deleted) {
    throw new Error(`Flashcard with id ${id} is already deleted`);
  }

  // Step 2: Mark flashcard as deleted (soft delete)
  const { error: updateError } = await supabase
    .from("flashcards")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) {
    throw new Error(`Failed to delete flashcard: ${updateError.message}`);
  }

  // Step 3: Return success
  return true;
}
