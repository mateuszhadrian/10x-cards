/**
 * Custom Test Utilities
 *
 * This file contains reusable test utilities and custom render functions
 * that wrap Testing Library's render with common providers.
 */

import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";

// Custom render function that includes common providers
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {}

/**
 * Custom render function with providers
 *
 * Use this instead of Testing Library's render when you need
 * to test components that depend on React context providers.
 */
export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  function Wrapper({ children }: { children: ReactNode }) {
    // Add your providers here
    // Example: <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock data generators
 */
export const mockFlashcard = (overrides = {}) => ({
  id: "1",
  user_id: "user-1",
  generation_id: "gen-1",
  question: "What is TypeScript?",
  answer: "A typed superset of JavaScript",
  difficulty: "medium" as const,
  tags: ["programming", "typescript"],
  source_material: "TypeScript documentation",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockGeneration = (overrides = {}) => ({
  id: "1",
  user_id: "user-1",
  input_text: "Sample input text",
  model_used: "gpt-4",
  prompt_tokens: 100,
  completion_tokens: 50,
  total_cost: 0.002,
  status: "completed" as const,
  created_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  id: "user-1",
  email: "test@example.com",
  created_at: new Date().toISOString(),
  ...overrides,
});

// Re-export everything from Testing Library
export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
