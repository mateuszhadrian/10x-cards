/**
 * Unit Tests - PaginationControl Component
 *
 * Tests pagination UI component logic and edge cases.
 * Priority 3: Important for list navigation and UX.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaginationControl from "@/components/PaginationControl";

describe("PaginationControl", () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    mockOnPageChange.mockClear();
  });

  describe("rendering", () => {
    it("should not render when totalPages is 1", () => {
      const { container } = render(
        <PaginationControl currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render when totalPages is less than 1", () => {
      const { container } = render(
        <PaginationControl currentPage={1} totalPages={0} onPageChange={mockOnPageChange} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render Previous and Next buttons", () => {
      render(<PaginationControl currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);

      expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to next page")).toBeInTheDocument();
    });

    it("should render all page numbers when totalPages is 7 or less", () => {
      render(<PaginationControl currentPage={3} totalPages={7} onPageChange={mockOnPageChange} />);

      for (let i = 1; i <= 7; i++) {
        expect(screen.getByLabelText(`Go to page ${i}`)).toBeInTheDocument();
      }
    });

    it("should render with ellipsis for large page count", () => {
      render(<PaginationControl currentPage={5} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show ellipsis
      const ellipsis = screen.getAllByText("...");
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it("should have proper aria-label on navigation", () => {
      render(<PaginationControl currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Pagination");
    });
  });

  describe("Previous button behavior", () => {
    it("should disable Previous button on first page", () => {
      render(<PaginationControl currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      expect(previousButton).toBeDisabled();
    });

    it("should enable Previous button when not on first page", () => {
      render(<PaginationControl currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      expect(previousButton).not.toBeDisabled();
    });

    it("should call onPageChange with previous page number", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      await user.click(previousButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("should not call onPageChange when disabled", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      await user.click(previousButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe("Next button behavior", () => {
    it("should disable Next button on last page", () => {
      render(<PaginationControl currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).toBeDisabled();
    });

    it("should enable Next button when not on last page", () => {
      render(<PaginationControl currentPage={4} totalPages={5} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByLabelText("Go to next page");
      expect(nextButton).not.toBeDisabled();
    });

    it("should call onPageChange with next page number", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByLabelText("Go to next page");
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it("should not call onPageChange when disabled", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByLabelText("Go to next page");
      await user.click(nextButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe("page number buttons", () => {
    it("should call onPageChange with clicked page number", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />);

      const page3Button = screen.getByLabelText("Go to page 3");
      await user.click(page3Button);

      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it("should not call onPageChange when clicking current page", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

      const currentPageButton = screen.getByLabelText("Go to page 3");
      await user.click(currentPageButton);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });

    it("should mark current page with aria-current", () => {
      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

      const currentPageButton = screen.getByLabelText("Go to page 3");
      expect(currentPageButton).toHaveAttribute("aria-current", "page");
    });

    it("should not mark other pages with aria-current", () => {
      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />);

      const otherPageButton = screen.getByLabelText("Go to page 2");
      expect(otherPageButton).not.toHaveAttribute("aria-current");
    });
  });

  describe("disabled prop", () => {
    it("should disable all buttons when disabled prop is true", () => {
      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} disabled={true} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      const nextButton = screen.getByLabelText("Go to next page");
      const page2Button = screen.getByLabelText("Go to page 2");

      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      expect(page2Button).toBeDisabled();
    });

    it("should not call onPageChange when disabled", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={3} totalPages={5} onPageChange={mockOnPageChange} disabled={true} />);

      const page2Button = screen.getByLabelText("Go to page 2");
      await user.click(page2Button);

      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe("page range calculation", () => {
    it("should show all pages for small total (3 pages)", () => {
      render(<PaginationControl currentPage={2} totalPages={3} onPageChange={mockOnPageChange} />);

      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 3")).toBeInTheDocument();
    });

    it("should show correct range when on first pages (page 1 of 20)", () => {
      render(<PaginationControl currentPage={1} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1, 2, 3, 4, 5, ..., 20
      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 5")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 20")).toBeInTheDocument();
    });

    it("should show correct range when on middle pages (page 10 of 20)", () => {
      render(<PaginationControl currentPage={10} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1, ..., 9, 10, 11, ..., 20
      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 9")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 10")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 11")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 20")).toBeInTheDocument();
    });

    it("should show correct range when on last pages (page 20 of 20)", () => {
      render(<PaginationControl currentPage={20} totalPages={20} onPageChange={mockOnPageChange} />);

      // Should show: 1, ..., 16, 17, 18, 19, 20
      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 16")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 20")).toBeInTheDocument();
    });

    it("should always show first and last page numbers", () => {
      render(<PaginationControl currentPage={10} totalPages={50} onPageChange={mockOnPageChange} />);

      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 50")).toBeInTheDocument();
    });

    it("should show ellipsis between ranges", () => {
      render(<PaginationControl currentPage={10} totalPages={50} onPageChange={mockOnPageChange} />);

      const ellipses = screen.getAllByText("...");
      expect(ellipses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("edge cases", () => {
    it("should handle totalPages of 2", () => {
      render(<PaginationControl currentPage={1} totalPages={2} onPageChange={mockOnPageChange} />);

      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 2")).toBeInTheDocument();
    });

    it("should handle very large totalPages (100)", () => {
      render(<PaginationControl currentPage={50} totalPages={100} onPageChange={mockOnPageChange} />);

      expect(screen.getByLabelText("Go to page 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Go to page 100")).toBeInTheDocument();
    });

    it("should handle navigation from first to second page", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={1} totalPages={10} onPageChange={mockOnPageChange} />);

      const nextButton = screen.getByLabelText("Go to next page");
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it("should handle navigation from last to second-to-last page", async () => {
      const user = userEvent.setup();

      render(<PaginationControl currentPage={10} totalPages={10} onPageChange={mockOnPageChange} />);

      const previousButton = screen.getByLabelText("Go to previous page");
      await user.click(previousButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(9);
    });
  });
});
