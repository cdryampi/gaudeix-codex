import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { CategoryBrandIcon } from "./CategoryBrandIcon";
import { FeaturedCategoryCard } from "./FeaturedCategoryCard";

describe("CategoryBrandIcon", () => {
  it("renders a custom brand icon when using a direct category key", () => {
    const { container } = render(<CategoryBrandIcon iconName="routes" />);

    expect(
      container.querySelector('[data-category-brand-icon="routes"]'),
    ).toBeInTheDocument();
  });

  it("renders a custom brand icon when the category key is mapped", () => {
    const { container } = render(<CategoryBrandIcon iconName="mountain" />);

    expect(
      container.querySelector('[data-category-brand-icon="routes"]'),
    ).toBeInTheDocument();
  });

  it("falls back to lucide when no custom brand icon exists", () => {
    const { container } = render(<CategoryBrandIcon iconName="rocket" />);

    expect(
      container.querySelector('[data-category-brand-icon="fallback"]'),
    ).toBeInTheDocument();
  });
});

describe("FeaturedCategoryCard", () => {
  it("uses the brand icon layer inside highlighted category cards", () => {
    const { container } = render(
      <MemoryRouter>
        <FeaturedCategoryCard
          category={{
            id: 1,
            title: "Rutas",
            href: "/rutas",
            image: null,
            icon: "mountain",
            description: "Senderos y caminos",
          }}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/rutas/i)).toBeInTheDocument();
    expect(
      container.querySelector('[data-category-brand-icon="routes"]'),
    ).toBeInTheDocument();
  });
});
