import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import BeachesCategoryLayout from "./BeachesCategoryLayout";
import { CategoryLayoutProps } from "../types";
import { Beach } from "@/features/beaches/types";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("@/components/animated/MotionReveal", () => ({
  MotionReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/animated/AnimatedCardGrid", () => ({
  AnimatedCardGrid: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/site/primitives", () => ({
  PageHero: ({
    title,
    description,
    metrics,
    actions,
    aside,
    media,
  }: {
    title: string;
    description?: string;
    metrics?: Array<{ label: string; value: string | number }>;
    actions?: ReactNode;
    aside?: ReactNode;
    media?: ReactNode;
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
      {aside}
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
  ContentCard: ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  ),
  DataCard: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  MunicipalCTA: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: string;
    actions?: ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {actions}
    </section>
  ),
}));

const mockCategory = {
  id: 10,
  slug: "beaches",
  nombre: "Playas",
  descripcion: "Costa de Cabrera de Mar",
  taxonomy: "template",
  parent: null,
  icon: "beaches",
  is_published: true,
  featured_media: null,
  attachments: [],
  created_at: "",
  updated_at: "",
};

const buildBeach = (id: number, title: string): Beach => ({
  id,
  slug: `beach-${id}`,
  title,
  description: "<p>Descripción</p>",
  location_text: "Cabrera de Mar",
  latitude: 41.5,
  longitude: 2.4,
  phone: "",
  email: "",
  website: "",
  booking_url: "",
  is_published: true,
  category: 1,
  template_key: "beaches",
  featured_media: null,
  attachments: [],
  created_at: "",
  updated_at: "",
  beach_type: "urban",
  environment_summary: "Paseo marítimo y acceso cómodo",
  recommended_for: ["families"],
  length_m: 320,
  access_notes: "Acceso directo",
  parking_info: "Parking cercano",
  public_transport_info: "Bus interurbano",
  services: { showers: true },
  accessibility_features: { accessible_access: true },
  gallery: [],
});

const renderLayout = (overrides?: Partial<CategoryLayoutProps>) =>
  render(
    <MemoryRouter>
      <BeachesCategoryLayout
        category={mockCategory}
        places={[]}
        events={[]}
        isLoadingPlaces={false}
        isLoadingEvents={false}
        {...overrides}
      />
    </MemoryRouter>,
  );

describe("BeachesCategoryLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it("shows the automatic comparison when exactly two beaches are available", () => {
    const beaches = [
      buildBeach(1, "Platja dels Vinyals"),
      buildBeach(2, "Platja del Molí"),
    ];

    renderLayout({ places: beaches as CategoryLayoutProps["places"] });

    expect(
      screen.getByRole("heading", { name: "Playas", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Compara nuestras playas" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Platja dels Vinyals").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Platja del Molí").length).toBeGreaterThan(0);
    expect(screen.getByText("Garantizada")).toBeInTheDocument();
  });

  it("falls back to the editorial listing when there are more than two beaches", () => {
    const beaches = [
      buildBeach(1, "Platja dels Vinyals"),
      buildBeach(2, "Platja del Molí"),
      buildBeach(3, "Platja de les Senies"),
    ];

    renderLayout({ places: beaches as CategoryLayoutProps["places"] });

    expect(
      screen.queryByRole("heading", { name: "Compara nuestras playas" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/nuestras playas ofrecen diferentes perfiles/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Platja de les Senies")).toBeInTheDocument();
  });
});
