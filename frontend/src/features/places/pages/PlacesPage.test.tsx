import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { PlacesPage } from "./PlacesPage";
import { Place } from "../types";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../api", () => ({
  getPlaces: vi.fn(),
}));

vi.mock("../components/PlaceCard", () => ({
  PlaceCard: ({ place, onMouseEnter, onMouseLeave }: any) => (
    <div
      data-testid={`place-card-${place.id}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {place.title}
    </div>
  ),
}));

vi.mock("@/components/site/InteractiveMap", () => ({
  InteractiveMap: () => <div data-testid="interactive-map">Map Component</div>,
}));

const mockPlaces: Place[] = [
  {
    id: 1,
    slug: "place-1",
    title: "Restaurante Uno",
    description: "Desc",
    location_text: "Loc 1",
    latitude: 41.0,
    longitude: 2.0,
    phone: "123",
    email: "a@b.com",
    website: "http://example.com",
    booking_url: "",
    is_published: true,
    category: 1,
    template_key: "restaurants",
    featured_media: null,
    attachments: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    slug: "place-2",
    title: "Hotel Dos",
    description: "Desc",
    location_text: "Loc 2",
    latitude: 41.1,
    longitude: 2.1,
    phone: "456",
    email: "c@d.com",
    website: "http://example.com",
    booking_url: "",
    is_published: true,
    category: 2,
    template_key: "accommodations",
    featured_media: null,
    attachments: [],
    created_at: "",
    updated_at: "",
  },
];

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PlacesPage />
    </MemoryRouter>,
  );

describe("PlacesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as any).mockReturnValue({
      data: mockPlaces,
      isLoading: false,
      error: null,
    });
  });

  it("renders list of places", () => {
    renderComponent();

    expect(screen.getByText("Restaurante Uno")).toBeInTheDocument();
    expect(screen.getByText("Hotel Dos")).toBeInTheDocument();
    expect(screen.getByText("2 lugares encontrados")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    (useQuery as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Buscando lugares...")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    (useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(
      screen.getByText("No hemos encontrado lugares con esos filtros."),
    ).toBeInTheDocument();
  });

  it("toggles view modes", () => {
    renderComponent();

    expect(screen.getByText("Restaurante Uno")).toBeInTheDocument();
    expect(screen.getByTestId("interactive-map")).toBeInTheDocument();
    expect(screen.getByTestId("places-list-panel")).not.toHaveClass("hidden");
    expect(screen.getByTestId("places-map-panel")).not.toHaveClass("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Vista mapa" }));

    expect(screen.getByTestId("places-list-panel")).toHaveClass("hidden");
    expect(screen.getByTestId("interactive-map")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Vista lista" }));
    expect(screen.getByTestId("places-map-panel")).toHaveClass("hidden");
    expect(screen.getByText("Restaurante Uno")).toBeInTheDocument();
  });
});
