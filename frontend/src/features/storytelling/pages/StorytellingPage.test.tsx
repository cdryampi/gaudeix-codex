import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StorytellingPage } from "./StorytellingPage";
import { listStories } from "@/features/storytelling/api";

vi.mock("@/features/storytelling/api", () => ({
  listStories: vi.fn(),
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

function renderStorytellingPage() {
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
        <StorytellingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const stories = [
  {
    id: 1,
    slug: "can-modolell",
    title: "Can Modolell i el culte a Mitra",
    summary: "Un relat sobre el santuari roma de Cabrera de Mar.",
    content: "Contingut complet.",
    audio_transcript: "Escolteu les pedres de Can Modolell.",
    is_published: true,
    historical_period: "Roman",
    reading_time: 5,
    difficulty: "medium",
    source_name: "Museu de Cabrera de Mar",
    source_url: "https://www.museudecabrerademar.cat/",
    featured_media: {
      id: "story-image",
      file: "https://example.com/story.jpg",
      variant_thumbnail: "https://example.com/story-thumb.jpg",
      variant_medium: "https://example.com/story-medium.jpg",
      variant_large: "https://example.com/story-large.jpg",
    },
  },
  {
    id: 2,
    slug: "bruixa-burriac",
    title: "La bruixa de Burriac",
    summary: "Llegenda oral vinculada al castell.",
    content: "Contingut complet.",
    audio_transcript: "",
    is_published: true,
    historical_period: "Legend",
    reading_time: 4,
    difficulty: "easy",
    source_name: "Ajuntament de Cabrera de Mar",
    source_url: "https://www.cabrerademar.cat/",
    featured_media: null,
  },
];

describe("StorytellingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders published stories with editorial metadata", async () => {
    vi.mocked(listStories).mockResolvedValue(stories);

    const { container } = renderStorytellingPage();

    await waitFor(() => {
      expect(
        screen.getAllByText(/can modolell i el culte a mitra/i).length,
      ).toBeGreaterThan(0);
    });

    expect(screen.getByText(/2 historias publicadas/i)).toBeInTheDocument();
    expect(screen.getByText(/museu de cabrera de mar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/5 min/i).length).toBeGreaterThan(0);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/story-medium.jpg",
    );
  });

  it("filters stories by search text", async () => {
    vi.mocked(listStories).mockResolvedValue(stories);

    const user = userEvent.setup();
    renderStorytellingPage();

    await waitFor(() => {
      expect(
        screen.getAllByText(/can modolell i el culte a mitra/i).length,
      ).toBeGreaterThan(0);
    });
    await user.type(screen.getByPlaceholderText(/buscar historias/i), "bruixa");

    expect(screen.queryByText(/can modolell/i)).not.toBeInTheDocument();
    expect(screen.getByText(/la bruixa de burriac/i)).toBeInTheDocument();
  });
});
