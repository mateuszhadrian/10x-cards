import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
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
 * @param generationId - The generation ID to verify
 * @returns True if the generation exists, throws an error otherwise
 * @throws Error if the generation doesn't exist
 */
async function verifyGenerationExists(supabase: SupabaseClient, generationId: number): Promise<boolean> {
  const { data: generation, error } = await supabase
    .from("generations")
    .select("id")
    .eq("id", generationId)
    .eq("user_id", DEFAULT_USER_ID)
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
 * @param flashcards - Array of flashcards to create
 * @returns Result containing the created flashcard records
 * @throws Error if validation fails or database operation fails
 */
export async function createFlashcards(
  supabase: SupabaseClient,
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
    await verifyGenerationExists(supabase, generationId);
  }

  // Step 2: Prepare flashcard records for insertion
  const flashcardsToInsert: FlashcardInsert[] = flashcards.map((flashcard) => ({
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.source,
    generation_id: flashcard.generation_id,
    user_id: DEFAULT_USER_ID,
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
