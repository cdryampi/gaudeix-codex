import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ActivityCard } from "../components/ActivityCard";
import { Activity } from "../types";

const mockActivity: Activity = {
  id: 1,
  slug: "activity-1",
  title: "Actividad Test",
  summary: "Resumen test",
  description: "Desc test",
  start_at: "2024-06-15T10:00:00Z",
  end_at: "2024-06-15T12:00:00Z",
  is_free: true,
  category: "música",
  program: 1,
  program_slug: "prog-1",
  venue: 1,
  venue_name: "Venue Test",
  status: "published" as const,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ActivityCard", () => {
  it("renders activity details correctly", () => {
    render(
      <MemoryRouter>
        <ActivityCard activity={mockActivity} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Actividad Test")).toBeInTheDocument();
    expect(screen.getByText("música")).toBeInTheDocument();
    expect(screen.getByText("Gratuita")).toBeInTheDocument();
    expect(screen.getByText("Venue Test")).toBeInTheDocument();
    expect(screen.getByText(/Programa: prog-1/)).toBeInTheDocument();
  });

  it("links to activity detail page", () => {
    render(
      <MemoryRouter>
        <ActivityCard activity={mockActivity} />
      </MemoryRouter>,
    );

    const link = screen.getByLabelText(/Veure detall de Actividad Test/i);
    expect(link.getAttribute("href")).toBe("/festes/activitats/activity-1");
  });
});
