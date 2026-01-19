/**
 * Example Unit Test - Testing React Components
 *
 * This demonstrates:
 * - Testing React components with Testing Library
 * - User interaction simulation
 * - Accessibility testing
 * - Visual regression with snapshots
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should apply variant classes correctly", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);

    let button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");

    rerender(<Button variant="outline">Cancel</Button>);
    button = screen.getByRole("button", { name: /cancel/i });
    expect(button).toHaveClass("border");
  });

  it("should apply size classes correctly", () => {
    render(<Button size="lg">Large Button</Button>);

    const button = screen.getByRole("button", { name: /large button/i });
    expect(button).toHaveClass("h-11");
  });

  it("should be disabled when disabled prop is true", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should merge custom className with default classes", () => {
    render(<Button className="custom-class">Button</Button>);

    const button = screen.getByRole("button", { name: /button/i });
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("inline-flex"); // default class
  });

  it("should be keyboard accessible", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Accessible</Button>);

    const button = screen.getByRole("button", { name: /accessible/i });
    button.focus();

    expect(button).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("should match snapshot", () => {
    const { container } = render(
      <Button variant="default" size="default">
        Snapshot Test
      </Button>
    );
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:outline-[3px] bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:opacity-80 h-8 px-4 text-[15px] leading-8"
        data-slot="button"
      >
        Snapshot Test
      </button>
    `);
  });
});
