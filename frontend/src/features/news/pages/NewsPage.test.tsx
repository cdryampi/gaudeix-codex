import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NewsPage } from "./NewsPage";
import { listNewsItems } from "@/features/news/api";

vi.mock("@/features/news/api", () => ({
  listNewsItems: vi.fn(),
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

function renderNewsPage() {
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
        <NewsPage />
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

describe("NewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders news items when the API returns content", async () => {
    vi.mocked(listNewsItems).mockResolvedValue([newsItem]);

    renderNewsPage();

    await waitFor(() => {
      expect(
        screen.getByText(/cabalgata cultural de primavera/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/1 noticia disponible/i)).toBeInTheDocument();
    expect(screen.getAllByText(/leer noticia completa/i)).toHaveLength(2);
  });

  it("shows an empty state when the API returns no news", async () => {
    vi.mocked(listNewsItems).mockResolvedValue([]);

    renderNewsPage();

    await waitFor(() => {
      expect(
        screen.getByText(/todavia no hay noticias publicadas/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /cuando el ayuntamiento publique nuevas noticias apareceran aqui/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows a recoverable error state when the API fails and can retry", async () => {
    vi.mocked(listNewsItems)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce([newsItem]);

    const user = userEvent.setup();
    renderNewsPage();

    await waitFor(() => {
      expect(
        screen.getByText(/no hemos podido cargar las noticias/i),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /reintentar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/cabalgata cultural de primavera/i),
      ).toBeInTheDocument();
    });

    expect(listNewsItems).toHaveBeenCalledTimes(2);
  });
});
