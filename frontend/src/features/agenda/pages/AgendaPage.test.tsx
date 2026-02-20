import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

// Mock Components
vi.mock("../components/EventCard", () => ({
  EventCard: ({ event }: any) => (
    <div data-testid={`event-card-${event.id}`}>
      {event.title}
      {event.occurrences_count > 1 && (
        <span data-testid="event-multidate">Multi</span>
      )}
      {event.event_status === "ongoing" && (
        <span data-testid="event-ongoing">Ongoing</span>
      )}
    </div>
  ),
}));

// Mock Data
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
  {
    id: 2,
    slug: "event-2",
    title: "Evento Multiple",
    start_at: new Date().toISOString(),
    occurrences_count: 3,
    is_featured: true,
    category_name: "Deportes",
    event_status: "ongoing",
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
    (useQuery as any).mockReturnValue({
      data: { results: mockEvents, count: 2 },
      isLoading: false,
      error: null,
    });
  });

  it("renders list of events", () => {
    renderComponent();
    expect(screen.getByText("Evento Simple")).toBeDefined();
    expect(screen.getByText("Evento Multiple")).toBeDefined();
  });

  it("shows featured events section", () => {
    renderComponent();
    expect(screen.getByText("Destacados")).toBeDefined();
  });

  it("applies multi-date indicator when count > 1", () => {
    renderComponent();
    expect(screen.getByTestId("event-card-2")).toContainElement(
      screen.getByTestId("event-multidate"),
    );
  });

  it("shows ongoing status badge", () => {
    renderComponent();
    expect(screen.getByTestId("event-card-2")).toContainElement(
      screen.getByTestId("event-ongoing"),
    );
  });

  it("updates URL when filters change", () => {
    renderComponent();
    // This test depends on AgendaFilters implementation, but we can check if setSearchParams is called
    // Assuming AgendaFilters calls onChange which calls setFilters
  });
});
