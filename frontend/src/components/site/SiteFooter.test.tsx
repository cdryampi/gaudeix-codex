import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SiteFooter } from "./SiteFooter";
import { getFooterPublic } from "@/features/site-settings/api/footerApi";

vi.mock("@/features/site-settings/api/footerApi", () => ({
  getFooterPublic: vi.fn(),
}));

function renderFooter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const fullFooterPayload = {
  id: 1,
  eyebrow: "Portal oficial",
  title: "Un footer sereno",
  description: "Informacion util, claridad institucional y acceso rapido.",
  show_social_links: true,
  show_contact_block: true,
  show_badges_block: true,
  copyright_text: "Ajuntament de Cabrera de Mar",
  branding: {
    site_name: "Gaudeix Cabrera",
    tagline: "Mediterraneo y municipal",
    logo: null,
    logo_dark: null,
    favicon: null,
  },
  contact: {
    phone: "93 759 00 91",
    support_email: "suport@cabrera.cat",
    contact_email: "turisme@cabrera.cat",
    address: "Placa de l'Ajuntament, 5",
    schedule: "L-V 09:00-14:00",
    maps_base_url: "https://maps.example.com",
    latitude: null,
    longitude: null,
  },
  social: {
    facebook_url: "https://facebook.com/cabrera",
    instagram_url: "https://instagram.com/cabrera",
    twitter_url: "",
    youtube_url: "https://youtube.com/cabrera",
  },
  legal: {
    privacy_page: {
      id: 11,
      slug: "privacidad",
      template: "privacy",
      titulo: "Privacidad",
    },
    cookies_page: {
      id: 12,
      slug: "cookies",
      template: "cookies",
      titulo: "Cookies",
    },
    legal_page: {
      id: 13,
      slug: "aviso-legal",
      template: "legal_notice",
      titulo: "Aviso legal",
    },
    inclusion_page: {
      id: 14,
      slug: "accesibilidad",
      template: "inclusion",
      titulo: "Accesibilidad",
    },
  },
  links: {
    explore: [
      {
        id: 1,
        section: "explore" as const,
        order: 0,
        type: "category" as const,
        label: "",
        url: "",
        category: {
          id: 31,
          slug: "playas",
          nombre: "Playas",
        },
        static_page: null,
      },
      {
        id: 2,
        section: "explore" as const,
        order: 1,
        type: "custom" as const,
        label: "Agenda",
        url: "/agenda",
        category: null,
        static_page: null,
      },
      {
        id: 5,
        section: "explore" as const,
        order: 2,
        type: "custom" as const,
        label: "Noticias",
        url: "/noticias",
        category: null,
        static_page: null,
      },
    ],
    institutional: [
      {
        id: 3,
        section: "institutional" as const,
        order: 0,
        type: "static_page" as const,
        label: "",
        url: "",
        category: null,
        static_page: {
          id: 41,
          slug: "oficina-turismo",
          titulo: "Oficina de turismo",
        },
      },
      {
        id: 4,
        section: "institutional" as const,
        order: 1,
        type: "custom" as const,
        label: "Transparencia viva",
        url: "https://cabrera.cat/transparencia-viva",
        category: null,
        static_page: null,
      },
    ],
  },
  badges: [
    {
      id: 1,
      title: "Turismo responsable",
      alt_text: "Sello de turismo responsable",
      url: "https://example.com/sello",
      order: 0,
      image: {
        id: 51,
        original_name: "badge.png",
        file: "https://example.com/badge.png",
        thumbnail_url: "https://example.com/badge-thumb.png",
      },
    },
  ],
};

describe("SiteFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders footer identity, grouped links, legal items, badges and support blocks", async () => {
    vi.mocked(getFooterPublic).mockResolvedValue(fullFooterPayload);

    renderFooter();

    await waitFor(() => {
      expect(screen.getByText(/un footer sereno/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/portal oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/playas/i)).toBeInTheDocument();
    expect(screen.getByText(/agenda/i)).toBeInTheDocument();
    expect(screen.getByText(/noticias/i)).toBeInTheDocument();
    expect(screen.getByText(/oficina de turismo/i)).toBeInTheDocument();
    expect(screen.getByText(/transparencia viva/i)).toBeInTheDocument();
    expect(screen.getByText(/privacidad/i)).toBeInTheDocument();
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/93 759 00 91/i)).toBeInTheDocument();
    expect(screen.getByText(/turisme@cabrera.cat/i)).toBeInTheDocument();
    expect(
      screen.getByAltText(/sello de turismo responsable/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/youtube/i)).toBeInTheDocument();
  });

  it("degrades cleanly when support blocks are missing or disabled", async () => {
    vi.mocked(getFooterPublic).mockResolvedValue({
      ...fullFooterPayload,
      show_social_links: false,
      show_contact_block: false,
      show_badges_block: false,
      legal: {
        privacy_page: null,
        cookies_page: null,
        legal_page: null,
        inclusion_page: null,
      },
      badges: [],
      social: {
        facebook_url: "",
        instagram_url: "",
        twitter_url: "",
        youtube_url: "",
      },
    });

    renderFooter();

    await waitFor(() => {
      expect(screen.getByText(/un footer sereno/i)).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/facebook/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/93 759 00 91/i)).not.toBeInTheDocument();
    expect(
      screen.queryByAltText(/sello de turismo responsable/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^privacidad$/i)).not.toBeInTheDocument();
  });

  it("resolves category, static page and custom links without legacy hardcoded items", async () => {
    vi.mocked(getFooterPublic).mockResolvedValue(fullFooterPayload);

    renderFooter();

    await waitFor(() => {
      expect(screen.getByText(/playas/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "Playas" })).toHaveAttribute(
      "href",
      "/categorias/playas",
    );
    expect(
      screen.getByRole("link", { name: "Oficina de turismo" }),
    ).toHaveAttribute("href", "/paginas/oficina-turismo");
    expect(
      screen.getByRole("link", { name: "Transparencia viva" }),
    ).toHaveAttribute("href", "https://cabrera.cat/transparencia-viva");
    expect(screen.getByRole("link", { name: "Noticias" })).toHaveAttribute(
      "href",
      "/noticias",
    );
    expect(
      screen.queryByText(/perfil del contratante/i),
    ).not.toBeInTheDocument();
  });
});
