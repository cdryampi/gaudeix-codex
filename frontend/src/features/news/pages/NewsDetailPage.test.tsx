import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewsDetailPage } from "./NewsDetailPage";
import { getNewsItem } from "@/features/news/api";
import { ApiRequestError } from "@/lib/api";

vi.mock("@/features/news/api", () => ({
  getNewsItem: vi.fn(),
}));

vi.mock("@/components/animated/MotionReveal", () => ({
  MotionReveal: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderNewsDetail(
  initialEntry = "/noticias/cabalgata-cultural-primavera",
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/noticias/:slug" element={<NewsDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const newsItem = {
  id: "1",
  title: "Cabalgata cultural de primavera",
  category: "Cultura" as const,
  imageUrl: "/placeholder-news.jpg",
  publishedAt: "2026-03-10T10:00:00Z",
  slug: "cabalgata-cultural-primavera",
  excerpt: "Una nueva agenda cultural llena la plaza mayor de actividad.",
  body: "Detalle completo de la noticia.",
};

describe("NewsDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the news content when the API returns the requested item", async () => {
    vi.mocked(getNewsItem).mockResolvedValue(newsItem);

    renderNewsDetail();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: /cabalgata cultural de primavera/i,
        }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(
        /una nueva agenda cultural llena la plaza mayor de actividad/i,
      ),
    ).toHaveLength(2);
    expect(
      screen.getByText(/detalle completo de la noticia/i),
    ).toBeInTheDocument();
  });

  it("shows a not found state when the API returns 404", async () => {
    vi.mocked(getNewsItem).mockRejectedValue(
      new ApiRequestError("Not found", {
        method: "GET",
        url: "http://localhost:8000/api/v1/news/cabalgata-cultural-primavera/",
        status: 404,
      }),
    );

    renderNewsDetail();

    await waitFor(() => {
      expect(screen.getByText(/noticia no encontrada/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /la noticia que buscas no esta disponible o ya no existe/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows a recoverable error state when the API request fails", async () => {
    vi.mocked(getNewsItem).mockRejectedValue(
      new ApiRequestError("Network error", {
        method: "GET",
        url: "http://localhost:8000/api/v1/news/cabalgata-cultural-primavera/",
        isNetworkError: true,
      }),
    );

    renderNewsDetail();

    await waitFor(() => {
      expect(
        screen.getByText(/no hemos podido cargar esta noticia/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/ha ocurrido un problema al conectar con el servicio/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reintentar/i }),
    ).toBeInTheDocument();
  });
});
