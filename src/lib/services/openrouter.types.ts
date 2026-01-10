/**
 * Type definitions for OpenRouter Service
 */

// ============================================================================
// Message Types
// ============================================================================

/**
 * Message types supported by the service
 */
export type MessageType = "system" | "user" | "assistant";

/**
 * Represents a chat message
 */
export interface Message {
  role: MessageType;
  content: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for the OpenRouter model
 */
export interface ModelConfig {
  modelName: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Service configuration options
 */
export interface OpenRouterServiceConfig {
  apiKey: string;
  apiEndpoint?: string;
  defaultModel?: string;
  timeout?: number;
}

// ============================================================================
// Response Format Types
// ============================================================================

/**
 * JSON Schema format for structured responses
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: object;
  };
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * OpenRouter API request payload
 */
export interface OpenRouterRequest {
  model: string;
  messages: Message[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * OpenRouter API response structure
 */
export interface OpenRouterResponse {
  id: string;
  model: string;
  created: number;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
