import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "./App";
import * as eventsApi from "@/features/events/api";
import * as categoriesApi from "@/features/categories/api";
import * as newsApi from "@/features/news/api";
import * as socialApi from "@/features/social/api";

// Mock the Google Maps API that's used by InteractiveMap component
vi.stubGlobal("google", {
  maps: {
    SymbolPath: {
      CIRCLE: "CIRCLE",
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
    </QueryClientProvider>
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
  });

  it("renders the home page initially", async () => {
    renderApp(["/"]);

    // Wait for something that is uniquely loaded in the HomePage.
    // "el Pueblo" is part of the "Explora el Pueblo" heading.
    await waitFor(() => {
      expect(screen.getByText(/el Pueblo/i)).toBeInTheDocument();
    });
  });

  it("navigates and renders the agenda page", async () => {
    renderApp(["/agenda"]);

    // Add expectations based on what AgendaPage renders
    // As we mocked data, it should render an empty state or the title
    await waitFor(() => {
      // Find a typical element from AgendaPage, e.g., a header or filter
      expect(screen.getByText(/Agenda Cultural/i)).toBeInTheDocument();
    });
  });
});
