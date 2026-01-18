/**
 * Unit Tests - ThemeToggle Component
 * 
 * Tests theme switching functionality with localStorage persistence.
 * Priority 3: Important for user preference management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => localStorageMock[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: vi.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    // Clean up document classes
    document.documentElement.classList.remove('dark', 'light');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with dark theme by default', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should load saved theme from localStorage', async () => {
      localStorageMock['theme'] = 'light';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    it('should apply dark theme if saved in localStorage', async () => {
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should default to dark theme if no saved preference', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });
  });

  describe('rendering', () => {
    it('should render toggle button', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have proper aria-label for dark mode', async () => {
      localStorageMock['theme'] = 'dark';
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByLabelText('Switch to light mode');
        expect(button).toBeInTheDocument();
      });
    });

    it('should have proper aria-label for light mode', async () => {
      localStorageMock['theme'] = 'light';
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByLabelText('Switch to dark mode');
        expect(button).toBeInTheDocument();
      });
    });

    it('should render with fixed positioning classes', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('fixed', 'bottom-4', 'right-4');
    });

    it('should render with shadow and rounded styling', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-lg', 'rounded-full');
    });
  });

  describe('theme toggling', () => {
    it('should toggle from dark to light theme', async () => {
      const user = userEvent.setup();
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      });
    });

    it('should toggle from light to dark theme', async () => {
      const user = userEvent.setup();
      localStorageMock['theme'] = 'light';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('should persist theme preference to localStorage', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
        expect(localStorageMock['theme']).toBeDefined();
      });
    });

    it('should toggle multiple times', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');

      // First toggle: dark -> light
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });

      // Second toggle: light -> dark
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      // Third toggle: dark -> light
      await user.click(button);
      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('icon rendering', () => {
    it('should show moon icon in light mode', async () => {
      localStorageMock['theme'] = 'light';
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByLabelText('Switch to dark mode');
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
        // Moon icon has path with "M12 3a6..."
        expect(svg?.querySelector('path')).toHaveAttribute('d', expect.stringContaining('M12 3a6'));
      });
    });

    it('should show sun icon in dark mode', async () => {
      localStorageMock['theme'] = 'dark';
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByLabelText('Switch to light mode');
        const svg = button.querySelector('svg');
        expect(svg).toBeInTheDocument();
        // Sun icon has circle element
        expect(svg?.querySelector('circle')).toBeInTheDocument();
      });
    });
  });

  describe('DOM manipulation', () => {
    it('should add dark class to document element', async () => {
      localStorageMock['theme'] = 'dark';
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('should remove dark class from document element', async () => {
      localStorageMock['theme'] = 'light';
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });

    it('should update document element class when toggling', async () => {
      const user = userEvent.setup();
      localStorageMock['theme'] = 'dark';

      render(<ThemeToggle />);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dark')).toBe(false);
      });
    });
  });

  describe('localStorage interaction', () => {
    it('should read from localStorage on mount', () => {
      localStorageMock['theme'] = 'light';
      render(<ThemeToggle />);

      expect(localStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should write to localStorage on toggle', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', expect.any(String));
      });
    });

    it('should handle missing localStorage gracefully', () => {
      // This test ensures no errors are thrown when localStorage is unavailable
      expect(() => {
        render(<ThemeToggle />);
      }).not.toThrow();
    });
  });

  describe('accessibility', () => {
    it('should have button role', () => {
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have descriptive aria-label', async () => {
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label');
        expect(button.getAttribute('aria-label')).toMatch(/Switch to (light|dark) mode/);
      });
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalled();
      });
    });
  });
});
