/**
 * Example Unit Test - Testing Utility Functions
 *
 * This demonstrates:
 * - Basic test structure with describe/it
 * - Testing pure functions
 * - Using expect assertions
 */

import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils", () => {
  describe("cn (className merger)", () => {
    it("should merge class names correctly", () => {
      const result = cn("foo", "bar");
      expect(result).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      const result = cn("foo", false && "bar", "baz");
      expect(result).toBe("foo baz");
    });

    it("should merge tailwind classes without conflicts", () => {
      const result = cn("px-2 py-1", "px-4");
      // Should keep only px-4 (last one wins)
      expect(result).toContain("px-4");
      expect(result).toContain("py-1");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle undefined and null", () => {
      const result = cn("foo", undefined, null, "bar");
      expect(result).toBe("foo bar");
    });
  });
});
