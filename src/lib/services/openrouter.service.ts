/**
 * OpenRouter Service
 *
 * Service for integrating with the OpenRouter API.
 * Handles LLM-powered chat completions with structured JSON responses.
 */

import type {
  Message,
  MessageType,
  ModelConfig,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterServiceConfig,
  ResponseFormat,
} from "./openrouter.types";

// Re-export types for consumers
export type {
  Message,
  MessageType,
  ModelConfig,
  OpenRouterRequest,
  OpenRouterResponse,
  OpenRouterServiceConfig,
  ResponseFormat,
};

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Custom error class for OpenRouter API errors
 */
export class OpenRouterError extends Error {
  public statusCode?: number;
  public isRetryable: boolean;

  constructor(message: string, statusCode?: number, isRetryable?: boolean) {
    super(message);
    this.name = "OpenRouterError";
    this.statusCode = statusCode;
    this.isRetryable = isRetryable ?? false;
  }
}

/**
 * Retry configuration for transient errors
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatusCodes: number[];
}

// ============================================================================
// OpenRouter Service Class
// ============================================================================

/**
 * OpenRouter Service
 *
 * Manages communication with the OpenRouter API for LLM-powered chat completions.
 * Provides session management, message formatting, and error handling.
 */
export class OpenRouterService {
  // Public fields
  public readonly apiEndpoint: string;
  public sessionHistory: Message[] = [];
  public responseFormat?: ResponseFormat;
  public modelConfig: ModelConfig;

  // Private fields
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };

  /**
   * Creates a new OpenRouterService instance
   *
   * @param config - Service configuration options
   */
  constructor(config: OpenRouterServiceConfig) {
    // Validate required configuration
    if (!config.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    // Initialize configuration
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint || "https://openrouter.ai/api/v1/chat/completions";
    this.timeout = config.timeout || 30000; // 30 seconds default

    // Initialize model configuration with defaults
    this.modelConfig = {
      modelName: config.defaultModel || "openai/gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 2000,
    };

    // Initialize empty session
    this.sessionHistory = [];
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Sends a message to the OpenRouter API
   *
   * @param message - The message content to send
   * @param type - The type of message ('system' or 'user')
   * @returns Promise with the API response
   */
  async sendMessage(message: string, type: "system" | "user"): Promise<OpenRouterResponse> {
    // Validate input
    if (!message || message.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    // Format and add message to session history
    const formattedMessage = this._formatMessage(message, type);
    this.sessionHistory.push(formattedMessage);

    try {
      // Send request to OpenRouter API
      const response = await this._sendRequest();

      // Handle and validate response
      const validatedResponse = this._handleApiResponse(response);

      // Add assistant response to session history
      if (validatedResponse.choices[0]?.message) {
        this.sessionHistory.push({
          role: "assistant",
          content: validatedResponse.choices[0].message.content,
        });
      }

      return validatedResponse;
    } catch (error) {
      this._logError(error as Error);
      throw error;
    }
  }

  /**
   * Configures the response format for structured JSON responses
   *
   * @param format - The response format configuration
   */
  setResponseFormat(format: ResponseFormat): void {
    // Validate format structure
    if (!format.type || format.type !== "json_schema") {
      throw new Error('Response format type must be "json_schema"');
    }

    if (!format.json_schema?.name || !format.json_schema?.schema) {
      throw new Error("Response format must include json_schema with name and schema");
    }

    this.responseFormat = format;
  }

  /**
   * Configures the model and its parameters
   *
   * @param options - Model configuration options
   */
  configureModel(options: { modelName?: string; parameters?: Partial<ModelConfig> }): void {
    if (options.modelName) {
      this.modelConfig.modelName = options.modelName;
    }

    if (options.parameters) {
      this.modelConfig = {
        ...this.modelConfig,
        ...options.parameters,
      };
    }
  }

  /**
   * Returns the current session history
   *
   * @returns Array of messages in the current session
   */
  getSessionHistory(): Message[] {
    return [...this.sessionHistory];
  }

  /**
   * Clears the session history
   */
  clearSession(): void {
    this.sessionHistory = [];
  }

  /**
   * Resets the service to initial state
   */
  reset(): void {
    this.sessionHistory = [];
    this.responseFormat = undefined;
  }

  /**
   * Adds a pre-formatted message to session history
   * Useful for building complex conversation flows
   *
   * @param message - The message to add
   */
  addMessage(message: Message): void {
    this.sessionHistory.push(message);
  }

  /**
   * Creates a system message with a predefined template
   *
   * @param template - Template name or custom system message
   * @param variables - Variables to inject into the template
   * @returns Formatted message
   */
  createSystemMessage(
    template: "flashcard_generator" | "general_assistant" | string,
    variables?: Record<string, string>
  ): Message {
    let content: string;

    switch (template) {
      case "flashcard_generator":
        content =
          "You are an expert educational content creator specialized in generating high-quality flashcards. " +
          "Your task is to analyze the provided text and create clear, concise, and effective flashcards that " +
          "help learners understand and retain key concepts. Each flashcard should have a clear question on the front " +
          "and a comprehensive answer on the back. Focus on important concepts, definitions, and relationships. " +
          "IMPORTANT: Always generate flashcards in the SAME LANGUAGE as the input text. " +
          "If the input text is in Polish, generate flashcards in Polish. " +
          "If the input text is in English, generate flashcards in English. " +
          "Maintain the same language throughout all flashcards.";
        break;

      case "general_assistant":
        content = "You are a helpful, accurate, and friendly AI assistant. Provide clear and concise responses.";
        break;

      default:
        content = template;
    }

    // Replace variables in template
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
      });
    }

    return this._formatMessage(content, "system");
  }

  /**
   * Builds a prompt for flashcard generation with specific requirements
   *
   * @param inputText - The text to generate flashcards from
   * @param options - Generation options
   * @returns Formatted user message
   */
  buildFlashcardPrompt(
    inputText: string,
    options?: {
      minCards?: number;
      maxCards?: number;
      difficulty?: "beginner" | "intermediate" | "advanced";
      focusAreas?: string[];
    }
  ): Message {
    const minCards = options?.minCards || 1;
    const maxCards = options?.maxCards || 30;
    const difficulty = options?.difficulty || "intermediate";
    const focusAreas = options?.focusAreas || [];

    let prompt = `Generate ${minCards}-${maxCards} flashcards from the following text. `;
    prompt += `Target difficulty level: ${difficulty}. `;

    if (focusAreas.length > 0) {
      prompt += `Focus on these areas: ${focusAreas.join(", ")}. `;
    }

    prompt += `CRITICAL: Generate ALL flashcards in the EXACT SAME LANGUAGE as the input text below. `;
    prompt += `Do not translate. Use the same language for both front and back of each flashcard. `;

    prompt += "\n\nText to analyze:\n\n";
    prompt += inputText;

    return this._formatMessage(prompt, "user");
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Formats a message for the API
   *
   * @param message - The message content
   * @param type - The message type
   * @returns Formatted message object
   */
  private _formatMessage(message: string, type: MessageType): Message {
    return {
      role: type,
      content: message.trim(),
    };
  }

  /**
   * Sends the request to OpenRouter API with retry logic
   *
   * @returns Promise with the API response
   */
  private async _sendRequest(): Promise<OpenRouterResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this._executeRequest();
        return response;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (error instanceof OpenRouterError && error.isRetryable && attempt < this.retryConfig.maxRetries) {
          const delay = this._calculateBackoffDelay(attempt);
          this._logRetry(attempt + 1, this.retryConfig.maxRetries, delay, error);
          await this._sleep(delay);
          continue;
        }

        // Non-retryable error or max retries reached
        throw error;
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  /**
   * Executes a single HTTP request to OpenRouter API
   *
   * @returns Promise with the API response
   */
  private async _executeRequest(): Promise<OpenRouterResponse> {
    // Build request payload
    const payload: OpenRouterRequest = {
      model: this.modelConfig.modelName,
      messages: this.sessionHistory,
      temperature: this.modelConfig.temperature,
      max_tokens: this.modelConfig.max_tokens,
      top_p: this.modelConfig.top_p,
      frequency_penalty: this.modelConfig.frequency_penalty,
      presence_penalty: this.modelConfig.presence_penalty,
    };

    // Add response format if configured
    if (this.responseFormat) {
      payload.response_format = this.responseFormat;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Send HTTP request
      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://10x-cards.app", // Optional: for OpenRouter analytics
          "X-Title": "10x Cards", // Optional: for OpenRouter analytics
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`;

        // Determine if error is retryable
        const isRetryable = this.retryConfig.retryableStatusCodes.includes(response.status);

        throw new OpenRouterError(errorMessage, response.status, isRetryable);
      }

      // Parse and return response
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout errors
      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterError(`Request timeout after ${this.timeout}ms`, 408, true);
      }

      // Handle network errors (retryable)
      if (error instanceof Error && error.message.includes("fetch")) {
        throw new OpenRouterError(`Network error: ${error.message}`, undefined, true);
      }

      throw error;
    }
  }

  /**
   * Calculates exponential backoff delay for retries
   *
   * @param attempt - Current retry attempt (0-indexed)
   * @returns Delay in milliseconds
   */
  private _calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
    return Math.min(exponentialDelay + jitter, this.retryConfig.maxDelay);
  }

  /**
   * Sleeps for specified duration
   *
   * @param ms - Milliseconds to sleep
   */
  private async _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Logs retry attempts
   *
   * @param attempt - Current attempt number
   * @param maxRetries - Maximum retry attempts
   * @param delay - Delay before next retry
   * @param error - The error that triggered the retry
   */
  private _logRetry(attempt: number, maxRetries: number, delay: number, error: Error): void {
    // eslint-disable-next-line no-console
    console.warn(`[OpenRouterService] Retry ${attempt}/${maxRetries} after ${Math.round(delay)}ms:`, {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handles and validates the API response
   *
   * @param response - The raw API response
   * @returns Validated response
   */
  private _handleApiResponse(response: OpenRouterResponse): OpenRouterResponse {
    // Validate response structure
    if (!response.choices || response.choices.length === 0) {
      throw new Error("Invalid API response: no choices returned");
    }

    if (!response.choices[0].message) {
      throw new Error("Invalid API response: no message in first choice");
    }

    // Validate JSON response if format is configured
    if (this.responseFormat) {
      try {
        JSON.parse(response.choices[0].message.content);
      } catch {
        throw new Error("Invalid API response: expected JSON but got invalid format");
      }
    }

    return response;
  }

  /**
   * Logs errors for debugging and monitoring
   *
   * @param error - The error to log
   */
  private _logError(error: Error): void {
    // eslint-disable-next-line no-console
    console.error("[OpenRouterService] Error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      sessionHistoryLength: this.sessionHistory.length,
      model: this.modelConfig.modelName,
    });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a new OpenRouter service instance
 *
 * @param apiKey - OpenRouter API key (required)
 * @returns New OpenRouterService instance
 */
export function createOpenRouterService(apiKey: string): OpenRouterService {
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  return new OpenRouterService({
    apiKey,
  });
}
