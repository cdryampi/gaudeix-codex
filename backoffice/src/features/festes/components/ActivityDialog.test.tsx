import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityDialog } from "./ActivityDialog";
import { eventsApi } from "@/features/events/api/events";

vi.mock("@/features/events/api/events", () => ({
  eventsApi: {
    getAll: vi.fn(),
  },
}));

const mockPrograms = [
  {
    id: 1,
    title: "Programa 1",
    slug: "p1",
    festa: 1,
    festa_slug: "f1",
    start_date: "2024-01-01",
    end_date: "2024-01-02",
    status: "published",
    is_published: true,
    order: 1,
    activities_count: 0,
    created_at: "",
    updated_at: "",
  },
];

const mockVenues = [
  {
    id: 1,
    name: "Venue 1",
    slug: "v1",
    address: "Calle 1",
    latitude: 0,
    longitude: 0,
    is_published: true,
    created_at: "",
    updated_at: "",
  },
];

const mockEvents = [
  {
    id: 101,
    title: "Evento Agenda 1",
    summary: "Resumen 1",
    venue_name: "Venue A",
  },
  {
    id: 102,
    title: "Evento Agenda 2",
    summary: "Resumen 2",
    venue_name: "Venue B",
  },
];

describe("ActivityDialog - Event Selector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(eventsApi.getAll).mockResolvedValue(mockEvents as any);
  });

  it("loads and displays events in the selector", async () => {
    render(
      <ActivityDialog
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        programs={mockPrograms as any}
        venues={mockVenues as any}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Evento Agenda 1")).toBeInTheDocument();
      expect(screen.getByText("Evento Agenda 2")).toBeInTheDocument();
    });
  });

  it("filters events by search term", async () => {
    render(
      <ActivityDialog
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        programs={mockPrograms as any}
        venues={mockVenues as any}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Evento Agenda 1")).toBeInTheDocument(),
    );

    const searchInput = screen.getByPlaceholderText(/Buscar evento/i);
    await userEvent.type(searchInput, "Agenda 2");

    expect(screen.queryByText("Evento Agenda 1")).not.toBeInTheDocument();
    expect(screen.getByText("Evento Agenda 2")).toBeInTheDocument();
  });

  it("shows selected event feedback", async () => {
    render(
      <ActivityDialog
        open={true}
        onOpenChange={() => {}}
        onSubmit={() => {}}
        programs={mockPrograms as any}
        venues={mockVenues as any}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText("Evento Agenda 1")).toBeInTheDocument(),
    );

    const options = screen.getAllByRole("option");
    const option = options.find(
      (o) => o.textContent === "Evento Agenda 1",
    ) as HTMLOptionElement;
    const selector = option.parentElement as HTMLSelectElement;
    await userEvent.selectOptions(selector, "101");

    expect(
      screen.getByText(/Evento seleccionado: Evento Agenda 1/),
    ).toBeInTheDocument();
  });
});
