import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { PlaceCard } from "./PlaceCard";
import { Place } from "../types";

const mockPlace: Place = {
  id: 1,
  slug: "test-place",
  title: "Test Place",
  description: "Description",
  location_text: "123 Test St",
  latitude: 41.0,
  longitude: 2.0,
  phone: "123456789",
  email: "test@example.com",
  website: "https://example.com",
  booking_url: "",
  is_published: true,
  category: 1,
  template_key: "restaurants",
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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("PlaceCard Component", () => {
  it("renders place title and location", () => {
    renderWithRouter(<PlaceCard place={mockPlace} />);

    expect(screen.getByText("Test Place")).toBeInTheDocument();
    expect(screen.getByText("123 Test St")).toBeInTheDocument();
  });

  it("renders category label correctly", () => {
    renderWithRouter(<PlaceCard place={mockPlace} />);

    expect(screen.getByText("Restaurantes")).toBeInTheDocument();
  });

  it("renders image with correct src", () => {
    renderWithRouter(<PlaceCard place={mockPlace} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "http://example.com/image-medium.jpg");
  });

  it("uses fallback image when no featured_media", () => {
    const placeNoMedia = { ...mockPlace, featured_media: null };
    renderWithRouter(<PlaceCard place={placeNoMedia} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/placeholder-place.jpg");
  });

  it("links to correct detail page", () => {
    renderWithRouter(<PlaceCard place={mockPlace} />);

    const link = screen.getByRole("link", { name: /Detalles/i });
    expect(link).toHaveAttribute("href", "/lugares/test-place");
  });

  it("calls onMouseEnter and onMouseLeave handlers", () => {
    const onMouseEnter = vi.fn();
    const onMouseLeave = vi.fn();

    renderWithRouter(
      <PlaceCard
        place={mockPlace}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />,
    );

    // The component has the handlers on the outer div, but we can't easily select it by role without adding a test-id.
    // However, the text is inside that div.
    const title = screen.getByText("Test Place");
    // We need to find the parent container.
    // Usually simplest is to add data-testid or just fire event on the element that bubbles up.
    // Let's try firing on the title which is inside the container.

    fireEvent.mouseEnter(title);
    expect(onMouseEnter).toHaveBeenCalled();

    fireEvent.mouseLeave(title);
    expect(onMouseLeave).toHaveBeenCalled();
  });
});
