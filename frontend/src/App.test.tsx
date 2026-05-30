import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "./App";
import * as eventsApi from "@/features/events/api";
import * as categoriesApi from "@/features/categories/api";
import * as newsApi from "@/features/news/api";
import * as socialApi from "@/features/social/api";
import * as footerApi from "@/features/site-settings/api";

// Mock the Google Maps API that's used by InteractiveMap component
vi.stubGlobal("google", {
  maps: {
    SymbolPath: {
      CIRCLE: "CIRCLE",
    },
    Point: function Point(x: number, y: number) {
      this.x = x;
      this.y = y;
    },
  },
});

// Mock the API calls
vi.mock("@/features/events/api", () => ({
  getEvents: vi.fn(),
}));

vi.mock("@/features/social/api", () => ({
  listSocialLinks: vi.fn(),
}));

vi.mock("@/features/categories/api", () => ({
  getCategories: vi.fn(),
}));

vi.mock("@/features/news/api", () => ({
  listNewsItems: vi.fn(),
}));

vi.mock("@/features/site-settings/api", () => ({
  getFooterPublic: vi.fn(),
  getSiteSettings: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for testing
    },
  },
});

const renderApp = (initialEntries = ["/"]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("App Smoke Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Provide basic mock implementations
    vi.mocked(socialApi.listSocialLinks).mockResolvedValue([]);

    vi.mocked(eventsApi.getEvents).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    vi.mocked(categoriesApi.getCategories).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    vi.mocked(newsApi.listNewsItems).mockResolvedValue([]);
    vi.mocked(footerApi.getSiteSettings).mockResolvedValue({
      id: 1,
      site_name: "Cabrera de Mar",
      tagline: "",
      address: "",
      phone: "",
      contact_email: "",
      latitude: null,
      longitude: null,
      maps_base_url: "",
    });
    vi.mocked(footerApi.getFooterPublic).mockResolvedValue({
      id: 1,
      eyebrow: "",
      title: "",
      description: "",
      show_social_links: false,
      show_contact_block: false,
      show_badges_block: false,
      copyright_text: "",
      branding: {
        site_name: "Cabrera de Mar",
        tagline: "",
        logo: null,
        logo_dark: null,
        favicon: null,
      },
      contact: {
        phone: "",
        support_email: "",
        contact_email: "",
        address: "",
        schedule: "",
        maps_base_url: "",
        latitude: null,
        longitude: null,
      },
      social: {
        facebook_url: "",
        instagram_url: "",
        twitter_url: "",
        youtube_url: "",
      },
      legal: {
        privacy_page: null,
        cookies_page: null,
        legal_page: null,
        inclusion_page: null,
      },
      links: {
        explore: [],
        institutional: [],
      },
      badges: [],
    });
  });

  it("renders the home page initially", async () => {
    renderApp(["/"]);

    await waitFor(() => {
      expect(screen.getAllByText(/Cabrera de Mar/i)[0]).toBeInTheDocument();
    });
  });

  it("navigates and renders the agenda page", async () => {
    renderApp(["/agenda"]);

    await waitFor(() => {
      expect(screen.getByText(/Agenda municipal/i)).toBeInTheDocument();
    });
  });
});
