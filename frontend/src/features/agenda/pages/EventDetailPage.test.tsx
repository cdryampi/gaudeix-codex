import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { EventDetailPage } from "./EventDetailPage";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => ({ mutate: vi.fn() })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
}));

// Mock API
vi.mock("@/features/events/api", () => ({
  getEventBySlug: vi.fn(),
  getEvents: vi.fn(),
}));

// Mock Data
const mockEvent = {
  id: 1,
  slug: "event-1",
  title: "Evento con Sesiones",
  summary: "Resumen",
  description: "Desc",
  start_at: new Date().toISOString(),
  occurrences_count: 2,
  category_name: "Cultura",
  tags: [],
  attachments: [],
  dates: [
    { id: 101, start_at: new Date(Date.now() - 100000).toISOString() }, // Past
    { id: 102, start_at: new Date(Date.now() + 100000).toISOString() }, // Future (Next)
  ],
  festes_activities: [],
};

const renderComponent = () => {
  return render(
    <MemoryRouter initialEntries={["/agenda/event-1"]}>
      <Routes>
        <Route path="/agenda/:slug" element={<EventDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("EventDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "event") {
        return { data: mockEvent, isLoading: false, error: null };
      }
      return { data: { results: [] }, isLoading: false };
    });
  });

  it("renders event details and title", () => {
    renderComponent();
    // Breadcrumbs and H1 both contain the title
    expect(screen.getAllByText("Evento con Sesiones").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByRole("heading", { name: "Evento con Sesiones" }),
    ).toBeDefined();
  });

  it("renders the full sessions list when multiple dates exist", () => {
    renderComponent();
    const sessionsList = screen.getByTestId("event-sessions-list");
    expect(sessionsList).toBeDefined();
    expect(sessionsList.children.length).toBeGreaterThan(1);
  });

  it("highlights the next upcoming session", () => {
    renderComponent();
    expect(screen.getByText("Próxima")).toBeDefined();
  });

  it("shows neutral festes state when event is not linked", () => {
    renderComponent();
    expect(screen.getByText(/sin acto/i)).toBeDefined();
  });

  it("renders CTA to Festa Major when linked to an activity", () => {
    const linkedEvent = {
      ...mockEvent,
      festes_activities: [
        {
          id: 1,
          slug: "activity-1",
          title: "Actividad 1",
          festa_slug: "festa-1",
        },
      ],
    };
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "event") {
        return { data: linkedEvent, isLoading: false, error: null };
      }
      return { data: { results: [] }, isLoading: false };
    });

    renderComponent();
    const link = screen.getByRole("link", { name: /actividad 1/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/festes/activitats/activity-1");
  });

  it("renders CTA to Festa Major when linked to a festa only", () => {
    const linkedEvent = {
      ...mockEvent,
      festes_activities: [
        { id: 1, festa_slug: "festa-1" }, // No activity slug
      ],
    };
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === "event") {
        return { data: linkedEvent, isLoading: false, error: null };
      }
      return { data: { results: [] }, isLoading: false };
    });

    renderComponent();
    const link = screen.getByRole("link", { name: /acto de festa major/i });
    expect(link.getAttribute("href")).toBe("/festes/festa-1");
  });
});
