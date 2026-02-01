import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlacesPage } from "./PlacesPage";
import { Place } from "../types";

// Mock dependencies
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

// Mock API
vi.mock("../api", () => ({
  getPlaces: vi.fn(),
}));

// Mock Components
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

// Mock Data
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

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <PlacesPage />
    </MemoryRouter>,
  );
};

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

    expect(screen.getByText("Buscando...")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    (useQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
  });

  it("toggles view modes", () => {
    renderComponent();

    // Default is split (list + map)
    const listContainer = screen
      .getByText("Restaurante Uno")
      .closest(".overflow-y-auto");
    const mapContainer = screen
      .getByTestId("interactive-map")
      .closest(".relative");

    // In split mode, both should be visible (logic in classNames)
    // Checking internal state via class changes is fragile but that's what we have
    // List has w-full md:w-[450px] ...
    expect(listContainer).toHaveClass("md:w-[450px]");

    // Click Map View
    const mapBtn = screen.getByTitle("Ver mapa");
    fireEvent.click(mapBtn);

    // Now list should have w-0 opacity-0
    expect(listContainer).toHaveClass("w-0");
    expect(listContainer).toHaveClass("opacity-0");

    // Click List View
    const listBtn = screen.getByTitle("Ver lista");
    fireEvent.click(listBtn);

    // Now list should be w-full
    expect(listContainer).toHaveClass("w-full");
    // Map should be hidden
    expect(mapContainer).toHaveClass("opacity-0");
  });

  // Note: Testing useSearchParams updates with MemoryRouter is tricky because
  // we can't easily assert the URL changed unless we use a custom history object or mock useSearchParams.
  // But we can check if the UI reacts to clicks (e.g. category active state).
  // However, without a real router or complex mock, we might just skip deep URL integration tests
  // or trust that MemoryRouter works.
});
