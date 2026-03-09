import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@/tests/test-utils";
import { FooterSettingsPage } from "../pages/FooterSettingsPage";

const footerSettingsApiMock = vi.hoisted(() => ({
  get: vi.fn(),
  getPublic: vi.fn(),
  update: vi.fn(),
}));

const footerLinksApiMock = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

const footerBadgesApiMock = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

const categoriesApiMock = vi.hoisted(() => ({
  list: vi.fn(),
}));

const staticPagesApiMock = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("../api/footerSettings", () => ({
  footerSettingsApi: footerSettingsApiMock,
}));

vi.mock("../api/footerLinks", () => ({
  footerLinksApi: footerLinksApiMock,
}));

vi.mock("../api/footerBadges", () => ({
  footerBadgesApi: footerBadgesApiMock,
}));

vi.mock("@/features/categories/api/categories", () => ({
  categoriesApi: categoriesApiMock,
}));

vi.mock("@/features/static-pages/api/staticPages", () => ({
  staticPagesApi: staticPagesApiMock,
}));

vi.mock("@/features/media/components/ImageSelector", () => ({
  ImageSelector: ({
    open,
    onSelect,
  }: {
    open: boolean;
    onSelect: (image: {
      id: number;
      original_name: string;
      file: string;
      mime_type: string;
      thumbnail_url: string;
    }) => void;
  }) =>
    open ? (
      <button
        type="button"
        onClick={() =>
          onSelect({
            id: 99,
            original_name: "badge.png",
            file: "/media/badge.png",
            mime_type: "image/png",
            thumbnail_url: "/media/badge-thumb.png",
          })
        }
      >
        Usar imagen mock
      </button>
    ) : null,
}));

const footerSettings = {
  id: 1,
  site_settings_id: 1,
  eyebrow: "Descubre",
  title: "Footer base",
  description: "Descripcion base",
  show_social_links: true,
  show_contact_block: true,
  show_badges_block: true,
  copyright_text: "Ajuntament",
};

const footerPublic = {
  id: 1,
  eyebrow: "Descubre",
  title: "Footer base",
  description: "Descripcion base",
  show_social_links: true,
  show_contact_block: true,
  show_badges_block: true,
  copyright_text: "Ajuntament",
  branding: {
    site_name: "Gaudeix",
    tagline: "Municipal",
    logo: null,
    logo_dark: null,
    favicon: null,
  },
  contact: {
    phone: "123",
    support_email: "support@example.com",
    contact_email: "hello@example.com",
    address: "Carrer Major",
    schedule: "9-14h",
    maps_base_url: "https://maps.example.com",
    latitude: null,
    longitude: null,
  },
  social: {
    facebook_url: "https://facebook.com/gaudeix",
    instagram_url: "",
    twitter_url: "",
    youtube_url: "https://youtube.com/gaudeix",
  },
  legal: {
    privacy_page: {
      id: 10,
      slug: "privacy",
      template: "privacy",
      titulo: "Privacidad",
    },
    cookies_page: null,
    legal_page: {
      id: 11,
      slug: "legal",
      template: "legal_notice",
      titulo: "Aviso legal",
    },
    inclusion_page: null,
  },
  links: {
    explore: [],
    institutional: [],
  },
  badges: [],
};

const footerLinks = [
  {
    id: 7,
    footer_settings_id: 1,
    section: "explore" as const,
    order: 1,
    is_active: true,
    type: "custom" as const,
    label: "Turismo sostenible",
    url: "https://example.com/sostenible",
    category_id: null,
    static_page_id: null,
  },
];

const footerBadges = [
  {
    id: 3,
    footer_settings_id: 1,
    title: "Sello azul",
    alt_text: "Certificado azul",
    url: "https://example.com/badge",
    image: null,
    image_id: null,
    order: 1,
    is_active: false,
  },
];

const categories = [{ id: 1, nombre: "Playas", slug: "playas" }];
const staticPages = [
  {
    id: 15,
    slug: "contacto",
    template: "contact",
    is_published: true,
    titulo: "Contacto",
  },
];

function setupApiMocks() {
  footerSettingsApiMock.get.mockResolvedValue(footerSettings);
  footerSettingsApiMock.getPublic.mockResolvedValue(footerPublic);
  footerSettingsApiMock.update.mockResolvedValue({
    ...footerSettings,
    title: "Footer actualizado",
  });
  footerLinksApiMock.list.mockResolvedValue(footerLinks);
  footerLinksApiMock.create.mockResolvedValue({
    id: 8,
    footer_settings_id: 1,
    section: "institutional",
    type: "custom",
    label: "Turismo responsable",
    url: "https://example.com/responsable",
    order: 4,
    is_active: true,
    category_id: null,
    static_page_id: null,
  });
  footerLinksApiMock.update.mockResolvedValue(footerLinks[0]);
  footerLinksApiMock.remove.mockResolvedValue(undefined);
  footerBadgesApiMock.list.mockResolvedValue(footerBadges);
  footerBadgesApiMock.create.mockResolvedValue({
    id: 4,
    footer_settings_id: 1,
    title: "Badge verde",
    alt_text: "Badge eco",
    url: "https://example.com/eco",
    image: {
      id: 99,
      original_name: "badge.png",
      file: "/media/badge.png",
      thumbnail_url: "/media/badge-thumb.png",
    },
    image_id: 99,
    order: 5,
    is_active: true,
  });
  footerBadgesApiMock.update.mockResolvedValue(footerBadges[0]);
  footerBadgesApiMock.remove.mockResolvedValue(undefined);
  categoriesApiMock.list.mockResolvedValue(categories);
  staticPagesApiMock.list.mockResolvedValue(staticPages);
}

function renderPage(initialEntry = "/dashboard/settings/footer") {
  return render(<FooterSettingsPage />, {
    router: { type: "memory", initialEntries: [initialEntry] },
  });
}

describe("FooterSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupApiMocks();
  });

  it("restores the badges tab from the query string", async () => {
    renderPage("/dashboard/settings/footer?tab=badges");

    expect(await screen.findByText("Sello azul")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /nuevo sello/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sin imagen/i)).toBeInTheDocument();
  });

  it("updates footer configuration and shows contextual links", async () => {
    renderPage();

    const titleInput = await screen.findByDisplayValue("Footer base");
    fireEvent.change(titleInput, { target: { value: "Footer actualizado" } });
    fireEvent.click(
      screen.getByRole("button", { name: /guardar configuracion/i }),
    );

    await waitFor(() =>
      expect(footerSettingsApiMock.update).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Footer actualizado" }),
      ),
    );

    expect(screen.getByRole("link", { name: /ir a site settings/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ir a redes sociales/i })).toBeInTheDocument();
  });

  it("creates a custom footer link from the links tab", async () => {
    renderPage("/dashboard/settings/footer?tab=links");

    await screen.findByText("Turismo sostenible");
    fireEvent.click(screen.getByRole("button", { name: /nuevo enlace/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Tipo"), {
      target: { value: "custom" },
    });
    fireEvent.change(within(dialog).getByLabelText("Seccion"), {
      target: { value: "institutional" },
    });
    fireEvent.change(within(dialog).getByLabelText("Etiqueta"), {
      target: { value: "Turismo responsable" },
    });
    fireEvent.change(within(dialog).getByLabelText("URL"), {
      target: { value: "https://example.com/responsable" },
    });
    fireEvent.change(within(dialog).getByLabelText("Orden"), {
      target: { value: "4" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: /guardar enlace/i }));

    await waitFor(() =>
      expect(footerLinksApiMock.create).toHaveBeenCalledWith({
        section: "institutional",
        type: "custom",
        label: "Turismo responsable",
        url: "https://example.com/responsable",
        category_id: null,
        static_page_id: null,
        order: 4,
        is_active: true,
      }),
    );
  });

  it("creates a badge with selected image from the badges tab", async () => {
    renderPage("/dashboard/settings/footer?tab=badges");

    await screen.findByText("Sello azul");
    fireEvent.click(screen.getByRole("button", { name: /nuevo sello/i }));

    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Titulo"), {
      target: { value: "Badge verde" },
    });
    fireEvent.change(within(dialog).getByLabelText("Alt text"), {
      target: { value: "Badge eco" },
    });
    fireEvent.change(within(dialog).getByLabelText("URL"), {
      target: { value: "https://example.com/eco" },
    });
    fireEvent.change(within(dialog).getByLabelText("Orden"), {
      target: { value: "5" },
    });

    fireEvent.click(within(dialog).getByRole("button", { name: /seleccionar imagen/i }));
    fireEvent.click(await screen.findByRole("button", { name: /usar imagen mock/i }));
    fireEvent.click(within(dialog).getByRole("button", { name: /guardar sello/i }));

    await waitFor(() =>
      expect(footerBadgesApiMock.create).toHaveBeenCalledWith({
        title: "Badge verde",
        alt_text: "Badge eco",
        url: "https://example.com/eco",
        image_id: 99,
        order: 5,
        is_active: true,
      }),
    );
  });
});
