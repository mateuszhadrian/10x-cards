/**
 * Unit Tests - useWindowSize Hook
 *
 * Tests responsive behavior detection hook.
 * Priority 2: Critical for UI responsiveness across devices.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowSize } from "@/components/hooks/useWindowSize";

describe("useWindowSize", () => {
  // Store original window properties
  let originalInnerWidth: number;
  let originalInnerHeight: number;

  beforeEach(() => {
    // Save original window dimensions
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe("initialization", () => {
    it("should initialize with desktop defaults (SSR safe)", () => {
      const { result } = renderHook(() => useWindowSize());

      // Initial state - could be test env window size or default from hook
      // The important part is that isMobile is false (SSR safe)
      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBeGreaterThanOrEqual(1024); // Desktop width
    });

    it("should update with actual window size after mount", () => {
      // Mock window dimensions
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1080,
      });

      const { result } = renderHook(() => useWindowSize());

      // Wait for useEffect to run
      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("mobile detection", () => {
    it("should mark as mobile when width is less than 1024px", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(768);
    });

    it("should mark as mobile when width is exactly 1023px", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1023,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);
    });

    it("should mark as mobile for typical phone width (375px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(375);
    });

    it("should mark as mobile for typical tablet portrait width (768px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.width).toBe(768);
    });
  });

  describe("desktop detection", () => {
    it("should mark as desktop when width is exactly 1024px (breakpoint)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBe(1024);
    });

    it("should mark as desktop when width is greater than 1024px", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBe(1440);
    });

    it("should mark as desktop for typical desktop width (1920px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBe(1920);
    });

    it("should mark as desktop for ultra-wide monitor (2560px)", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 2560,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBe(2560);
    });
  });

  describe("resize handling", () => {
    it("should update dimensions on window resize", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 900,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(1440);
      expect(result.current.height).toBe(900);

      // Resize window
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(768);
      expect(result.current.height).toBe(1024);
      expect(result.current.isMobile).toBe(true);
    });

    it("should toggle isMobile flag when crossing breakpoint", () => {
      // Start desktop
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);

      // Resize to mobile
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(true);

      // Resize back to desktop
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1100,
      });

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.isMobile).toBe(false);
    });

    it("should handle rapid resize events", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { result } = renderHook(() => useWindowSize());

      // Dispatch multiple resize events rapidly
      act(() => {
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(1440);
      expect(result.current.isMobile).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useWindowSize());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it("should not update state after unmount", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });

      const { result, unmount } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      const widthBeforeUnmount = result.current.width;

      unmount();

      // Change window size after unmount
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      // Width should not change after unmount
      expect(result.current.width).toBe(widthBeforeUnmount);
    });
  });

  describe("edge cases", () => {
    it("should handle very small window sizes", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 320,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 568,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(320);
      expect(result.current.height).toBe(568);
      expect(result.current.isMobile).toBe(true);
    });

    it("should handle very large window sizes", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 3840,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 2160,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(3840);
      expect(result.current.height).toBe(2160);
      expect(result.current.isMobile).toBe(false);
    });

    it("should handle height changes independently", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1440,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 900,
      });

      const { result } = renderHook(() => useWindowSize());

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.height).toBe(900);

      // Change only height
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 600,
      });

      act(() => {
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.width).toBe(1440);
      expect(result.current.height).toBe(600);
      expect(result.current.isMobile).toBe(false); // Width unchanged
    });
  });
});
