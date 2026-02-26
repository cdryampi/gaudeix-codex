import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EventCard } from "./EventCard";

const mockEvent = {
  id: 1,
  slug: "event-1",
  title: "Evento Test",
  summary: "Resumen",
  description: "Desc",
  start_at: new Date().toISOString(),
  occurrences_count: 1,
  category_name: "Cultura",
  event_status: "upcoming" as const,
  is_free: true,
  tags: [],
  attachments: [],
};

describe("EventCard", () => {
  it("renders normal event details", () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent as any} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Evento Test")).toBeInTheDocument();
    expect(screen.queryByText("Acto de Festa Major")).not.toBeInTheDocument();
  });

  it("renders Sparkles badge when linked to Festes", () => {
    const linkedEvent = {
      ...mockEvent,
      festes_activities: [{ id: 1, title: "Acto Festa" }],
    };

    render(
      <MemoryRouter>
        <EventCard event={linkedEvent as any} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Acto de Festa Major")).toBeInTheDocument();
    const link = screen.getByText("Acto de Festa Major").closest("a");
    expect(link?.getAttribute("href")).toBe("/festes/programacio");
  });
});
