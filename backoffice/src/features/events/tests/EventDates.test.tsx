import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventDialog } from "../components/EventDialog";
import React from "react";

// Mock child components or modules
vi.mock("../api/events", () => ({
  eventsApi: {
    getOccurrences: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/media/api/media", () => ({
  mediaApi: {
    listImages: vi.fn().mockResolvedValue([]),
    listDocuments: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/categories/api/categories", () => ({
  categoriesApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/tags/api/tags", () => ({
  tagsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

describe("EventDialog Logic", () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sanity check", () => {
    expect(1 + 1).toBe(2);
  });

  test("adds a date", async () => {
    const { container } = render(
      <EventDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const datesTab = screen.getByRole("button", { name: /fechas/i });
    fireEvent.click(datesTab);

    // Label association is missing in component, using selector
    const startInput = container.querySelector('input[type="datetime-local"]');
    if (!startInput) throw new Error("Start date input not found");

    fireEvent.change(startInput, { target: { value: "2026-02-01T10:00" } });

    const addButton = screen.getByRole("button", { name: /registrar fecha/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });

  test("prevents overlapping sessions", async () => {
    const { container } = render(
      <EventDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const datesTab = screen.getByRole("button", { name: /fechas/i });
    fireEvent.click(datesTab);

    const startInput = container.querySelector('input[type="datetime-local"]');
    if (!startInput) throw new Error("Start date input not found");

    // Add first session
    fireEvent.change(startInput, { target: { value: "2026-02-01T10:00" } });
    const addButton = screen.getByRole("button", { name: /registrar fecha/i });
    fireEvent.click(addButton);

    // Attempt to add overlapping session
    fireEvent.change(startInput, { target: { value: "2026-02-01T10:30" } });
    fireEvent.click(addButton);

    // Should show error toast (mocked or checked via behavior)
    // Since we use sonner, we can check if the session was NOT added
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(1);
  });
});
