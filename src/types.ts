/**
 * DTO and Command Model definitions for the API.
 * These types map directly to the database models defined in src/db/database.types.ts.
 */

import type { Database } from "./db/database.types";

// Aliases for Database models for ease of use
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
type FlashcardUpdate = Database["public"]["Tables"]["flashcards"]["Update"];
type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];
type GenerationErrorsRow = Database["public"]["Tables"]["generations_errors"]["Row"];

// Valid source values for flashcards
export type FlashcardSource = "ai-full" | "ai-edited" | "manual";

// 1. List Flashcards Response DTO
export interface ListFlashcardsResponseDTO {
  flashcards: FlashcardRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// 2. Create Flashcard Command DTO
// Represents a single flashcard to be created via API.
// Omits auto-generated fields (id, created_at, updated_at) and server-set fields (user_id).
export interface CreateFlashcardCommandDTO {
  front: string;
  back: string;
  source: FlashcardSource;
  generation_id: number | null;
}

// 2b. Bulk Create Flashcards Command DTO
// Wraps multiple flashcards for batch creation.
export interface CreateFlashcardsCommandDTO {
  flashcards: CreateFlashcardCommandDTO[];
}

// 2c. Create Flashcards Response DTO
// Response after successfully creating flashcards.
export interface CreateFlashcardsResponseDTO {
  message: string;
  flashcards: FlashcardRow[];
}

// 3. Get Flashcard Details DTO - represents the full flashcard details.
export type GetFlashcardDetailsDTO = FlashcardRow;

// 4. Update Flashcard Command DTO - allows updating only the front and back fields.
export type UpdateFlashcardCommandDTO = Pick<FlashcardUpdate, "front" | "back">;

// 5. Delete Flashcard Command DTO - identifying the flashcard to delete.
export interface DeleteFlashcardCommandDTO {
  id: number;
}

// 6. Trigger Generation Command DTO
// Represents a command to start the AI flashcard generation process.
// The "input_text" must be validated on the API level to be between 1000 and 10000 characters.
export interface TriggerGenerationCommandDTO {
  input_text: string;
}

// 7. Generation Response DTO
// Contains the generation record, generated flashcards (as proposals), and a success message.
export interface GenerationResponseDTO {
  message: string;
  generation: GenerationRow;
  flashcards: FlashcardRow[];
}

// 8. Get Generation Details DTO - includes generation details along with associated flashcards.
export type GetGenerationDetailsDTO = GenerationRow & { flashcards: FlashcardRow[] };

// 9. List Generations Response DTO
export interface ListGenerationsResponseDTO {
  generations: GenerationRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

// 10. Get Generation Errors Response DTO
export interface GetGenerationErrorsResponseDTO {
  generation_id: number;
  errors: GenerationErrorsRow[];
}

// 11. Edit Flashcard Proposal Command DTO
// Allows editing a flashcard proposal before it is finalized.
export interface EditFlashcardProposalCommandDTO {
  id: number;
  front: string;
  back: string;
}

// 12. Create Flashcards Command View Model DTO
// Local model used in the generate view for managing flashcard proposals.
// Extends the creation model with UI-specific fields for acceptance and edit tracking.
export interface CreateFlashcardsCommandViewModelDTO {
  front: string;
  back: string;
  source: "ai-full" | "ai-edited";
  accepted: boolean; // Determines if flashcard should be saved in bulk-save
  edited: boolean; // Tracks if user modified the flashcard
}

// ===== NAVIGATION TYPES =====

// Navigation link model
export interface NavLink {
  label: string;
  path: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

// User status for navigation
export type UserStatus = "authenticated" | "unauthenticated" | "loading";

// Navigation props
export interface NavigationProps {
  currentPath: string;
  userStatus: UserStatus;
}
