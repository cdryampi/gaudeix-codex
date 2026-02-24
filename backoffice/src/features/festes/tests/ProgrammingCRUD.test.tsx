/**
 * Unit tests for Festes Programming CRUD operations in backoffice.
 * Tests ProgramsPage rendering with mocked API.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgramsPage } from "../pages/ProgramsPage";
import { Program, Festa } from "../types";

// Mock API
vi.mock("../api/programs", () => ({
  programsApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../api/festes", () => ({
  festesApi: {
    getAll: vi.fn(),
  },
}));

import { programsApi } from "../api/programs";
import { festesApi } from "../api/festes";

// Test fixtures
const mockFesta: Festa = {
  id: 1,
  slug: "festa-major-2024",
  title: "Festa Major 2024",
  subtitle: "La gran festa de l'any",
  summary: "Una gran festa",
  description: "Descripció completa",
  program_text: "",
  start_date: "2024-06-15",
  end_date: "2024-06-24",
  year: 2024,
  duration_days: 10,
  is_published: true,
  is_featured: true,
  is_current: true,
  category: 1,
  category_slug: "festes",
  category_name: "Festes",
  tags: [],
  featured_media: null,
  poster: null,
  program_pdf: null,
  gallery: [],
  sponsors: [],
  events_count: 0,
  image_url: "",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockProgram: Program = {
  id: 1,
  slug: "dia-1-programa",
  festa: 1,
  festa_slug: "festa-major-2024",
  title: "Dia 1 - Programa",
  subtitle: "Primer dia de festa",
  description: "Descripció del programa",
  status: "published",
  is_published: true,
  order: 1,
  start_date: "2024-06-15",
  end_date: "2024-06-16",
  activities_count: 5,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ProgramsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", async () => {
    vi.mocked(programsApi.getAll).mockImplementation(
      () => new Promise(() => {})
    );
    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    expect(screen.getByText("Cargando programas...")).toBeInTheDocument();
  });

  it("shows error state when API fails", async () => {
    vi.mocked(programsApi.getAll).mockRejectedValue(new Error("Network error"));
    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Error al cargar los programas.")).toBeInTheDocument();
    });
  });

  it("shows empty state when no programs", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("No hay programas creados.")).toBeInTheDocument();
    });
  });

  it("displays programs in table", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [mockProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dia 1 - Programa")).toBeInTheDocument();
    });
  });

  it("displays festa name for program", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [mockProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Festa Major 2024")).toBeInTheDocument();
    });
  });

  it("shows published badge for published programs", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [mockProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Publicado")).toBeInTheDocument();
    });
  });

  it("shows draft badge for unpublished programs", async () => {
    const draftProgram = { ...mockProgram, id: 2, slug: "dia-2", is_published: false, title: "Dia 2 - Borrador" };
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [draftProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Borrador")).toBeInTheDocument();
    });
  });

  it("has new program button", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [mockProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Nuevo programa/i })).toBeInTheDocument();
    });
  });

  it("has pagination info", async () => {
    vi.mocked(programsApi.getAll).mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [mockProgram],
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });
  });

  it("filters programs by search term", async () => {
    const programs = [
      mockProgram,
      { ...mockProgram, id: 2, slug: "other", title: "Other Program" },
    ];
    vi.mocked(programsApi.getAll).mockImplementation(async (params) => {
      if (params?.search === "Other") {
        return {
          count: 1,
          next: null,
          previous: null,
          results: [{ ...mockProgram, id: 2, slug: "other", title: "Other Program" }],
        };
      }
      return {
        count: 2,
        next: null,
        previous: null,
        results: programs,
      };
    });

    vi.mocked(festesApi.getAll).mockResolvedValue([mockFesta]);

    render(<ProgramsPage />);

    await waitFor(() => {
      expect(screen.getByText("Dia 1 - Programa")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Título, slug o festa/i);
    await userEvent.type(searchInput, "Other");

    await waitFor(() => {
      expect(screen.queryByText("Dia 1 - Programa")).not.toBeInTheDocument();
      expect(screen.getByText("Other Program")).toBeInTheDocument();
    });
  });
});
