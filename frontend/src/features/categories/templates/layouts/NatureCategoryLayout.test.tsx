import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NatureCategoryLayout from "./NatureCategoryLayout";

vi.mock("@/components/animated/MotionReveal", () => ({
  MotionReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/features/places/components/PlaceCard", () => ({
  PlaceCard: ({ place }: { place: { title: string } }) => (
    <div>{place.title}</div>
  ),
}));

const baseCategory = {
  id: 1,
  slug: "beaches",
  nombre: "Playas",
  descripcion: "Descubre nuestras playas",
  taxonomy: "places",
  parent: null,
  icon: "umbrella",
  is_published: true,
  featured_media: null,
  attachments: [],
  created_at: "2025-01-01",
  updated_at: "2025-01-01",
};

const makePlace = (id: number) => ({
  id,
  slug: `playa-${id}`,
  title: `Playa ${id}`,
  description: "",
  location_text: `Zona ${id}`,
  latitude: 41,
  longitude: 2,
  phone: id === 1 ? "123" : "",
  email: "",
  website: "",
  booking_url: "",
  is_published: true,
  category: 1,
  template_key: "beaches",
  featured_media: null,
  attachments: [],
  created_at: "2025-01-01",
  updated_at: "2025-01-01",
});

describe("NatureCategoryLayout beaches comparison", () => {
  it("shows comparison only when exactly two beaches are available", () => {
    render(
      <MemoryRouter>
        <NatureCategoryLayout
          category={baseCategory as any}
          places={[makePlace(1), makePlace(2)] as any}
          events={[] as any}
          isLoadingPlaces={false}
          isLoadingEvents={false}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Compara les dues platges publicades"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Selecció editorial")).not.toBeInTheDocument();
  });

  it("shows editorial fallback when published beaches are not exactly two", () => {
    render(
      <MemoryRouter>
        <NatureCategoryLayout
          category={baseCategory as any}
          places={
            [makePlace(1), makePlace(2), makePlace(3), makePlace(4)] as any
          }
          events={[] as any}
          isLoadingPlaces={false}
          isLoadingEvents={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Selecció editorial")).toBeInTheDocument();
    expect(
      screen.queryByText("Compara les dues platges publicades"),
    ).not.toBeInTheDocument();
  });
});
