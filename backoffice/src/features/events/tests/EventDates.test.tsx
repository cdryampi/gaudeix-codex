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
    render(
      <EventDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />,
    );

    const datesTab = screen.getByRole("tab", { name: /fechas/i });
    fireEvent.click(datesTab);

    const startInput = screen.getByLabelText(/inicio/i);
    fireEvent.change(startInput, { target: { value: "2026-02-01T10:00" } });

    const addButton = screen.getByRole("button", { name: /registrar fecha/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });
});
