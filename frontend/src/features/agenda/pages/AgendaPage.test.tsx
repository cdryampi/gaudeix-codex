import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { AgendaPage } from "./AgendaPage";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

const mockSetSearchParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

// Mock API
vi.mock("@/features/events/api", () => ({
  getEvents: vi.fn(),
}));

const mockEvents = [
  {
    id: 1,
    slug: "event-1",
    title: "Evento Simple",
    start_at: new Date().toISOString(),
    occurrences_count: 1,
    is_featured: false,
    category_name: "Cultura",
    event_status: "upcoming",
    dates: [],
  },
];

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <AgendaPage />
    </MemoryRouter>,
  );
};

describe("AgendaPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchParams as any).mockReturnValue([
      new URLSearchParams(),
      mockSetSearchParams,
    ]);
  });

  it("renders the empty state correctly", async () => {
    (useQuery as any).mockReturnValue({
      data: { results: [], count: 0 },
      isLoading: false,
      error: null,
    });
    renderComponent();
    expect(
      await screen.findByText(/Sin eventos para esta selección/i),
    ).toBeInTheDocument();
  });
});
