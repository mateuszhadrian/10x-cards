import { createHash } from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { Database } from "../../db/database.types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { createOpenRouterService, type ResponseFormat } from "./openrouter.service";

type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];
type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];

/**
 * Result of the generation initiation process.
 */
export interface GenerationResult {
  generation: GenerationRow;
  flashcards: FlashcardRow[];
}

/**
 * Generates an MD5 hash of the input text for deduplication.
 * MD5 is sufficient for checksum/fingerprint purposes where cryptographic security is not required.
 *
 * @param text - The text to hash
 * @returns A 32-character hex string representation of the MD5 hash
 */
function generateTextHash(text: string): string {
  return createHash("md5").update(text, "utf8").digest("hex");
}

/**
 * Schema for AI-generated flashcards response
 */
const FLASHCARDS_RESPONSE_SCHEMA: ResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "flashcards_generation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        flashcards: {
          type: "array",
          items: {
            type: "object",
            properties: {
              front: {
                type: "string",
                description: "The question or prompt on the front of the flashcard",
              },
              back: {
                type: "string",
                description: "The answer or explanation on the back of the flashcard",
              },
            },
            required: ["front", "back"],
            additionalProperties: false,
          },
          minItems: 1,
          maxItems: 30,
          description: "Array of flashcards generated from the input text",
        },
      },
      required: ["flashcards"],
      additionalProperties: false,
    },
  },
};

/**
 * AI service that generates flashcard proposals based on input text using OpenRouter.
 *
 * @param inputText - The text to generate flashcards from
 * @returns An array of flashcard proposals (between 1 and 30)
 */
async function aiGenerateFlashcards(inputText: string): Promise<{ front: string; back: string }[]> {
  try {
    // Create OpenRouter service instance
    const openRouterService = createOpenRouterService();

    // Configure response format for structured output
    openRouterService.setResponseFormat(FLASHCARDS_RESPONSE_SCHEMA);

    // Set system message with flashcard generation template
    const systemMessage = openRouterService.createSystemMessage("flashcard_generator");
    openRouterService.addMessage(systemMessage);

    // Build flashcard generation prompt
    const userMessage = openRouterService.buildFlashcardPrompt(inputText, {
      minCards: 1,
      maxCards: 30,
      difficulty: "intermediate",
    });

    // Send request and get response
    const response = await openRouterService.sendMessage(userMessage.content, "user");

    // Parse structured JSON response
    const result = JSON.parse(response.choices[0].message.content) as {
      flashcards: { front: string; back: string }[];
    };

    // Validate response
    if (!result.flashcards || !Array.isArray(result.flashcards) || result.flashcards.length === 0) {
      throw new Error("Invalid response format: no flashcards returned");
    }

    return result.flashcards;
  } catch (error) {
    // Log error and re-throw
    // eslint-disable-next-line no-console
    console.error("[aiGenerateFlashcards] Error:", error);
    throw error;
  }
}

/**
 * Initiates the flashcard generation process.
 *
 * This function:
 * 1. Creates a generation record in the database
 * 2. Calls the AI service to generate flashcard proposals
 * 3. Returns the generation record and flashcard proposals (not saved to DB yet)
 * 4. Logs errors to generations_errors table if the AI service fails
 *
 * @param supabase - Supabase client instance
 * @param inputText - The input text to generate flashcards from (1000-10000 chars)
 * @returns Generation result with generation record and flashcard proposals
 * @throws Error if generation fails or no flashcards are generated
 */
export async function initiateGeneration(supabase: SupabaseClient, inputText: string): Promise<GenerationResult> {
  const startTime = Date.now();

  // Generate hash of the input text for deduplication (checksum)
  const textHash = generateTextHash(inputText);

  // Step 1: Create a generation record
  const { data: generation, error: generationError } = await supabase
    .from("generations")
    .insert({
      user_id: DEFAULT_USER_ID,
      model: "openai/gpt-4o-mini", // OpenRouter model
      source_text_length: inputText.length,
      source_text_hash: textHash,
      generation_duration: 0, // Will be updated after generation completes
    })
    .select()
    .single();

  if (generationError || !generation) {
    throw new Error(`Failed to create generation record: ${generationError?.message || "Unknown error"}`);
  }

  try {
    // Step 2: Call AI service to generate flashcards (with 60s timeout)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI service timeout after 60 seconds")), 60000)
    );

    const flashcardsPromise = aiGenerateFlashcards(inputText);

    const aiFlashcards = await Promise.race([flashcardsPromise, timeoutPromise]);

    // Step 3: Validate that we got flashcards
    if (!aiFlashcards || aiFlashcards.length === 0) {
      throw new Error("No flashcards generated by AI service");
    }

    // Step 4: Transform AI flashcards to FlashcardRow format (as proposals)
    // Note: These are NOT saved to the database yet
    const flashcardProposals: FlashcardRow[] = aiFlashcards.map((card, index) => ({
      id: -(index + 1), // Negative IDs for proposals (not in DB)
      front: card.front,
      back: card.back,
      source: "ai-full" as const,
      generation_id: generation.id,
      user_id: DEFAULT_USER_ID,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Step 5: Update generation record with duration
    const duration = Date.now() - startTime;
    const { error: updateError } = await supabase
      .from("generations")
      .update({
        generation_duration: duration,
      })
      .eq("id", generation.id);

    if (updateError) {
      // Non-critical error, log but continue
      // eslint-disable-next-line no-console
      console.warn("Failed to update generation duration:", updateError);
    }

    return {
      generation: {
        ...generation,
        generation_duration: duration,
      },
      flashcards: flashcardProposals,
    };
  } catch (error) {
    // Step 6: Log error to generations_errors table
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);

    const { error: logError } = await supabase.from("generations_errors").insert({
      generation_id: generation.id,
      error_type: "ai_service_error",
      error_message: errorMessage,
      error_details: {
        message: errorMessage,
        stack: errorDetails,
        timestamp: new Date().toISOString(),
      },
    });

    if (logError) {
      // eslint-disable-next-line no-console
      console.error("Failed to log generation error:", logError);
    }

    // Re-throw the error to be handled by the endpoint
    throw new Error(`Generation failed: ${errorMessage}`);
  }
}
