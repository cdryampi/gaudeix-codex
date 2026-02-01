import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PlaceDetailPage } from "./PlaceDetailPage";
import { Place, Restaurant, Accommodation } from "../types";

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

const mockBasePlace: Place = {
  id: 1,
  slug: "test-place",
  title: "Test Place",
  description: "<p>Test Description</p>",
  location_text: "Test Location",
  latitude: 41.0,
  longitude: 2.0,
  phone: "123456789",
  email: "test@example.com",
  website: "https://example.com",
  booking_url: "https://booking.com",
  is_published: true,
  category: 1,
  template_key: "generic",
  featured_media: {
    id: "img1",
    file: "http://example.com/image.jpg",
    variant_thumbnail: "http://example.com/image-thumb.jpg",
    variant_medium: "http://example.com/image-medium.jpg",
    variant_large: "http://example.com/image-large.jpg",
    title: "Test Image",
  },
  attachments: [],
  created_at: "2023-01-01",
  updated_at: "2023-01-01",
};

const mockRestaurant: Restaurant = {
  ...mockBasePlace,
  template_key: "restaurants",
  cuisine_type: "Italian",
  amenities: "Wifi, Terrace",
  capacity: 50,
};

const mockAccommodation: Accommodation = {
  ...mockBasePlace,
  template_key: "accommodations",
  type: "Hotel",
  stars: 4,
  amenities: "Pool, Spa",
  check_in_time: "14:00",
  check_out_time: "11:00",
};

const renderComponent = (slug = "test-place") => {
  return render(
    <MemoryRouter initialEntries={[`/lugares/${slug}`]}>
      <Routes>
        <Route path="/lugares/:slug" element={<PlaceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("PlaceDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton when loading", () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderComponent();
    // Check for skeleton elements (using container query or class check could be fragile,
    // but PlaceDetailSkeleton has animate-pulse class)
    // Here we can check if main content is NOT present yet
    expect(screen.queryByText("Test Place")).not.toBeInTheDocument();

    // We can query by role or class if we add test-ids, but skeleton structure is simple divs
    // Let's assume if it renders and doesn't crash, it's the skeleton.
    // Or we can check for animate-pulse class
    const skeleton = document.querySelector(".animate-pulse");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders error state when place not found or error", () => {
    (useQuery as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Not found"),
    });

    renderComponent();
    expect(screen.getByText("Lugar no encontrado")).toBeInTheDocument();
  });

  it("renders generic place details", () => {
    (useQuery as any).mockReturnValue({
      data: mockBasePlace,
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(
      screen.getByRole("heading", { name: "Test Place", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Test Location")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();

    // Check contact info
    expect(screen.getByText("123456789")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Visitar sitio")).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByText("Reservar ahora")).toHaveAttribute(
      "href",
      "https://booking.com",
    );
  });

  it("renders restaurant specific details", () => {
    (useQuery as any).mockReturnValue({
      data: mockRestaurant,
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Cocina y Servicios")).toBeInTheDocument();
    expect(screen.getByText(/Tipo: Italian/)).toBeInTheDocument();
    expect(screen.getByText(/Capacidad: 50 personas/)).toBeInTheDocument();
  });

  it("renders accommodation specific details", () => {
    (useQuery as any).mockReturnValue({
      data: mockAccommodation,
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Horarios")).toBeInTheDocument();
    expect(screen.getByText(/Check-in: 14:00/)).toBeInTheDocument();
    expect(screen.getByText(/Check-out: 11:00/)).toBeInTheDocument();

    // Check stars rendering (it renders icons, hard to check text)
    // We can check if the star container is present or check for SVG elements if we really want to be specific
    // For now, let's trust if content renders, logic is sound.
  });
});
