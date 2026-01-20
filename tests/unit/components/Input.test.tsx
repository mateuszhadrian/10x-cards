/**
 * Unit Tests - Input Component
 *
 * Tests form input component with validation states and accessibility.
 * Priority 3: Important for form UX and a11y compliance.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";
import { createRef } from "react";

describe("Input", () => {
  describe("rendering", () => {
    it("should render input element", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should render with type text by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("text");
    });

    it("should render with specified type", () => {
      render(<Input type="email" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("email");
    });

    it("should render with password type", () => {
      render(<Input type="password" />);

      // Password inputs don't have role="textbox"
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it("should render with number type", () => {
      render(<Input type="number" />);

      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.type).toBe("number");
    });

    it("should apply default styling classes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("flex", "h-9", "w-full", "rounded-lg", "border");
    });

    it("should merge custom className with default classes", () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("custom-class");
      expect(input).toHaveClass("flex", "h-9"); // Should still have default classes
    });
  });

  describe("value and onChange", () => {
    it("should handle controlled input", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input value="" onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      expect(handleChange).toHaveBeenCalled();
    });

    it("should update value on user input", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "Hello");

      expect(input.value).toBe("Hello");
      expect(handleChange).toHaveBeenCalledTimes(5); // Once per character
    });

    it("should handle empty input", () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render(<Input value="" onChange={() => {}} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("");
    });

    it("should display initial value", () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render(<Input value="Initial Value" onChange={() => {}} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("Initial Value");
    });
  });

  describe("placeholder", () => {
    it("should render with placeholder", () => {
      render(<Input placeholder="Enter text..." />);

      const input = screen.getByPlaceholderText("Enter text...");
      expect(input).toBeInTheDocument();
    });

    it("should apply placeholder styling", () => {
      render(<Input placeholder="Test" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("placeholder:text-muted-foreground");
    });
  });

  describe("disabled state", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should not be disabled by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });

    it("should apply disabled styling", () => {
      render(<Input disabled />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
    });

    it("should not trigger onChange when disabled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "test");

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("validation states", () => {
    it("should accept aria-invalid attribute", () => {
      render(<Input aria-invalid={true} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should not have aria-invalid by default", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("should accept aria-describedby for error messages", () => {
      render(<Input aria-describedby="error-message" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", "error-message");
    });
  });

  describe("ref forwarding", () => {
    it("should forward ref to input element", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe("INPUT");
    });

    it("should allow ref to access input methods", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current?.focus).toBeInstanceOf(Function);
      expect(ref.current?.blur).toBeInstanceOf(Function);
    });

    it("should allow programmatic focus via ref", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      ref.current?.focus();
      expect(ref.current).toHaveFocus();
    });
  });

  describe("accessibility", () => {
    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox");
      await user.tab();

      expect(input).toHaveFocus();
    });

    it("should support aria-label", () => {
      render(<Input aria-label="Email address" />);

      const input = screen.getByLabelText("Email address");
      expect(input).toBeInTheDocument();
    });

    it("should support id attribute for label association", () => {
      render(
        <div>
          <label htmlFor="test-input">Test Label</label>
          <Input id="test-input" />
        </div>
      );

      const input = screen.getByLabelText("Test Label");
      expect(input).toBeInTheDocument();
    });

    it("should have focus-visible styles", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("focus-visible:outline-none");
    });

    it("should support required attribute", () => {
      render(<Input required />);

      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
    });

    it("should support readonly attribute", () => {
      render(<Input readOnly />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });
  });

  describe("input types", () => {
    it("should handle email type", () => {
      render(<Input type="email" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("email");
    });

    it("should handle tel type", () => {
      render(<Input type="tel" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("tel");
    });

    it("should handle url type", () => {
      render(<Input type="url" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.type).toBe("url");
    });

    it("should handle search type", () => {
      render(<Input type="search" />);

      const input = screen.getByRole("searchbox") as HTMLInputElement;
      expect(input.type).toBe("search");
    });

    it("should handle date type", () => {
      render(<Input type="date" />);

      const input = document.querySelector('input[type="date"]') as HTMLInputElement;
      expect(input?.type).toBe("date");
    });
  });

  describe("event handlers", () => {
    it("should call onFocus when focused", async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();

      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole("textbox");
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it("should call onBlur when blurred", async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();

      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });

    it("should call onKeyDown when key is pressed", async () => {
      const user = userEvent.setup();
      const handleKeyDown = vi.fn();

      render(<Input onKeyDown={handleKeyDown} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "a");

      expect(handleKeyDown).toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("should have transition classes", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("transition-colors");
    });

    it("should have border styling", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("border", "border-border");
    });

    it("should have shadow styling", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("shadow-sm");
    });

    it("should have rounded corners", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("rounded-lg");
    });

    it("should have proper height", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("h-9");
    });

    it("should be full width", () => {
      render(<Input />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveClass("w-full");
    });
  });

  describe("edge cases", () => {
    it("should handle very long values", () => {
      const longValue = "a".repeat(1000);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render(<Input value={longValue} onChange={() => {}} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });

    it("should handle special characters", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "!@#$%^&*()");

      expect(input.value).toBe("!@#$%^&*()");
    });

    it("should handle unicode characters", async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await user.type(input, "你好世界 🚀");

      expect(input.value).toContain("你好世界");
    });

    it("should handle maxLength attribute", () => {
      render(<Input maxLength={10} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.maxLength).toBe(10);
    });

    it("should handle pattern attribute", () => {
      render(<Input pattern="[0-9]*" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("pattern", "[0-9]*");
    });

    it("should handle autoComplete attribute", () => {
      render(<Input autoComplete="email" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("autocomplete", "email");
    });
  });
});
