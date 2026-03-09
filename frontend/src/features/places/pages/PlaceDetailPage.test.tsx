import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { PlaceDetailPage } from "./PlaceDetailPage";
import { Place, Restaurant, Accommodation } from "../types";

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

const renderComponent = (slug = "test-place") =>
  render(
    <MemoryRouter initialEntries={[`/lugares/${slug}`]}>
      <Routes>
        <Route path="/lugares/:slug" element={<PlaceDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

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
    expect(screen.queryByText("Test Place")).not.toBeInTheDocument();
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
    expect(screen.getAllByText("Test Location").length).toBeGreaterThan(0);
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("123456789")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Web oficial")).toHaveAttribute(
      "href",
      "https://example.com",
    );
    expect(screen.getByText("Reservar")).toHaveAttribute("href", "https://booking.com");
  });

  it("renders restaurant specific details", () => {
    (useQuery as any).mockReturnValue({
      data: mockRestaurant,
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Restauracion")).toBeInTheDocument();
    expect(screen.getByText(/Tipo de cocina: Italian/)).toBeInTheDocument();
    expect(screen.getByText(/Capacidad estimada: 50 personas/)).toBeInTheDocument();
  });

  it("renders accommodation specific details", () => {
    (useQuery as any).mockReturnValue({
      data: mockAccommodation,
      isLoading: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Alojamiento")).toBeInTheDocument();
    expect(screen.getByText(/Check-in: 14:00/)).toBeInTheDocument();
    expect(screen.getByText(/Check-out: 11:00/)).toBeInTheDocument();
  });
});
