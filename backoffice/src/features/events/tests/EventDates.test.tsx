import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/tests/test-utils";
import { EventDialog } from "../components/EventDialog";

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

vi.mock("../components/EventPreview", () => ({
  EventPreview: () => null,
}));

describe("EventDialog dates", () => {
  const mockOnSubmit = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockReset();
    mockOnOpenChange.mockReset();
  });

  const openDatesTab = async () => {
    const view = render(
      <EventDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /fechas/i }));
    return view;
  };

  it("adds a date row", async () => {
    const { container } = await openDatesTab();

    const startInput = container.querySelector(
      'input[type="datetime-local"]',
    ) as HTMLInputElement | null;
    expect(startInput).not.toBeNull();

    await userEvent.type(startInput!, "2026-02-01T10:00");
    await userEvent.click(
      screen.getByRole("button", { name: /registrar fecha/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });

  it("prevents overlapping sessions", async () => {
    const { container } = await openDatesTab();

    const startInput = container.querySelector(
      'input[type="datetime-local"]',
    ) as HTMLInputElement | null;
    expect(startInput).not.toBeNull();

    await userEvent.type(startInput!, "2026-02-01T10:00");
    await userEvent.click(
      screen.getByRole("button", { name: /registrar fecha/i }),
    );

    await userEvent.clear(startInput!);
    await userEvent.type(startInput!, "2026-02-01T10:30");
    await userEvent.click(
      screen.getByRole("button", { name: /registrar fecha/i }),
    );

    expect(container.querySelectorAll("tbody tr")).toHaveLength(1);
  });
});
