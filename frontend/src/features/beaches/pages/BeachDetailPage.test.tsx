import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { BeachDetailPage } from "./BeachDetailPage";
import { Beach } from "../types";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/components/animated/MotionReveal", () => ({
  MotionReveal: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/features/places/components/NearbyPlaces", () => ({
  NearbyPlaces: () => <div data-testid="nearby-places">Nearby places</div>,
}));

vi.mock("@/components/site/primitives", () => ({
  PageHero: ({
    title,
    description,
    metrics,
    actions,
    media,
  }: {
    title: string;
    description?: string;
    metrics?: Array<{ label: string; value: string | number }>;
    actions?: React.ReactNode;
    media?: React.ReactNode;
  }) => (
    <section>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {metrics?.map((metric) => (
        <div key={metric.label}>
          <span>{metric.label}</span>
          <span>{String(metric.value)}</span>
        </div>
      ))}
      {actions}
      {media}
    </section>
  ),
  InfoBand: ({
    items,
  }: {
    items: Array<{ title: string; description?: string }>;
  }) => (
    <section>
      {items.map((item) => (
        <div key={item.title}>
          <h2>{item.title}</h2>
          {item.description ? <p>{item.description}</p> : null}
        </div>
      ))}
    </section>
  ),
  SectionHeader: ({
    eyebrow,
    title,
    description,
  }: {
    eyebrow?: string;
    title: string;
    description?: string;
  }) => (
    <div>
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  ),
  ContentCard: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));

const mockBeach: Beach = {
  id: 21,
  slug: "platja-dels-vinyals",
  title: "Platja dels Vinyals",
  description: "<p>Ideal para familias y baño tranquilo.</p>",
  location_text: "Passeig Marítim",
  latitude: 41.5,
  longitude: 2.4,
  phone: "937500000",
  email: "platges@cabrerademar.cat",
  website: "https://example.com/playa",
  booking_url: "https://example.com/info",
  is_published: true,
  category: 1,
  template_key: "beaches",
  featured_media: {
    id: 1,
    file: "https://example.com/beach.jpg",
    variant_thumbnail: "https://example.com/beach-thumb.jpg",
    variant_medium: "https://example.com/beach-medium.jpg",
    variant_large: "https://example.com/beach-large.jpg",
    title: "Vista general",
  },
  attachments: [],
  created_at: "",
  updated_at: "",
  beach_type: "urban",
  environment_summary: "Playa urbana con paseo marítimo",
  recommended_for: ["families", "sunset"],
  length_m: 350,
  access_notes: "Acceso desde el paseo",
  parking_info: "Parking cercano",
  public_transport_info: "Bus y estación próxima",
  services: { showers: true, beach_bar: true },
  accessibility_features: { accessible_access: true },
  gallery: [
    {
      id: 2,
      file: "https://example.com/beach-2.jpg",
      variant_thumbnail: "https://example.com/beach-2-thumb.jpg",
      variant_medium: "https://example.com/beach-2-medium.jpg",
      variant_large: "https://example.com/beach-2-large.jpg",
      title: "Entorno",
    },
  ],
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/playas/platja-dels-vinyals"]}>
      <Routes>
        <Route path="/playas/:slug" element={<BeachDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe("BeachDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dedicated beach detail with services, accessibility and map context", () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockBeach,
      isLoading: false,
      error: null,
    });

    renderPage();

    expect(
      screen.getByRole("heading", { name: "Platja dels Vinyals", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Playa urbana")).toBeInTheDocument();
    expect(screen.getByText("Duchas")).toBeInTheDocument();
    expect(screen.getByText("Chiringuito")).toBeInTheDocument();
    expect(screen.getByText("Acceso accesible")).toBeInTheDocument();
    expect(screen.getByText("Familias")).toBeInTheDocument();
    expect(screen.getByText("Atardecer")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cómo llegar con maps/i }),
    ).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps/search"),
    );
    expect(screen.getByTestId("nearby-places")).toBeInTheDocument();
  });

  it("shows the not found state when the beach is missing", () => {
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Not found"),
    });

    renderPage();

    expect(screen.getByText("Playa no encontrada")).toBeInTheDocument();
  });
});
