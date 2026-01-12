import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

/**
 * Custom hook to track window size and determine if viewport should use compact layout
 * Compact breakpoint: < 1024px (Tailwind's lg breakpoint)
 *
 * Note: To prevent hydration mismatch, we always start with desktop layout (isMobile: false)
 * and update after mounting on the client side.
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 1280,
    height: 768,
    isMobile: false, // Always start with false to match SSR
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 1024,
      });
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
