/**
 * Unit tests for Routes CRUD and GPX generation in backoffice.
 * Tests RoutesPage rendering + RouteDialog submit behavior.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/tests/test-utils";
import userEvent from "@testing-library/user-event";
import { RoutesPage } from "../pages/RoutesPage";
import { Route } from "../types";

// ── Mock APIs ──────────────────────────────────────────────

vi.mock("../api/routes", () => ({
  routesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    generateGpx: vi.fn(),
    autoTranslate: vi.fn(),
  },
}));

vi.mock("@/features/media/api/media", () => ({
  mediaApi: {
    listImages: vi.fn().mockResolvedValue([]),
    listDocuments: vi.fn().mockResolvedValue([]),
    listVideos: vi.fn().mockResolvedValue([]),
    upload: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/features/categories/api/categories", () => ({
  categoriesApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/tags/api/tags", () => ({
  tagsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/features/places/api/places", () => ({
  placesApi: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}));

// Mock sonner toasts
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { routesApi } from "../api/routes";

// ── Fixtures ────────────────────────────────────────────────

const mockRoute: Route = {
  id: 1,
  slug: "coastal-loop",
  title: "Coastal Loop",
  summary: "A coastal hiking route",
  description: "Full description",
  instructions: "Follow the trail markers",
  route_type: "walking",
  difficulty: "moderate",
  distance_km: 12.4,
  duration_minutes: 215,
  duration_formatted: "3h 35m",
  elevation_gain: 430,
  elevation_loss: 420,
  start_latitude: 41.6205,
  start_longitude: 2.6878,
  end_latitude: 41.64,
  end_longitude: 2.705,
  is_circular: true,
  is_published: true,
  is_featured: false,
  tags: [],
  featured_media: null,
  gpx_file: null,
  attachments: [],
  gallery: [],
  waypoints_list: [],
  checkpoints_list: [],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockRouteWithGpx: Route = {
  ...mockRoute,
  gpx_file: {
    id: 55,
    type: "document",
    original_name: "coastal-loop.gpx",
    mime_type: "application/gpx+xml",
    size_bytes: 1198,
    file: "/media/uploads/documents/abc123.gpx",
  },
};

// ── Tests ───────────────────────────────────────────────────

describe("RoutesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state initially", async () => {
    vi.mocked(routesApi.getAll).mockImplementation(() => new Promise(() => { }));
    render(<RoutesPage />);
    expect(screen.getByText("Cargando rutas...")).toBeInTheDocument();
  });

  it("shows error state when API fails", async () => {
    vi.mocked(routesApi.getAll).mockRejectedValue(new Error("Network error"));
    render(<RoutesPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar las rutas."),
      ).toBeInTheDocument();
    });
  });

  it("displays routes in table", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    render(<RoutesPage />);
    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });
  });

  it("has new route button", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    render(<RoutesPage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Nueva ruta/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows published badge for published routes", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    render(<RoutesPage />);
    await waitFor(() => {
      expect(screen.getByText("Publicada")).toBeInTheDocument();
    });
  });

  it("shows draft badge for unpublished routes", async () => {
    const draftRoute = {
      ...mockRoute,
      is_published: false,
      slug: "draft",
      title: "Draft Route",
    };
    vi.mocked(routesApi.getAll).mockResolvedValue([draftRoute]);
    render(<RoutesPage />);
    await waitFor(() => {
      expect(screen.getByText("Borrador")).toBeInTheDocument();
    });
  });

  it("has pagination info", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    render(<RoutesPage />);
    await waitFor(() => {
      expect(screen.getByText(/Página 1 de 1/)).toBeInTheDocument();
    });
  });
});

describe("RouteDialog - Form Submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens edit dialog when edit button is clicked", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });

    const editBtn = screen.getByLabelText("Editar Coastal Loop");
    await userEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText("Editar ruta")).toBeInTheDocument();
    });
  });

  it("sends update WITH gpx_file_id in payload to preserve GPX state", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    vi.mocked(routesApi.update).mockResolvedValue(mockRoute);
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });

    // Open edit dialog
    await userEvent.click(screen.getByLabelText("Editar Coastal Loop"));
    await waitFor(() => {
      expect(screen.getByText("Editar ruta")).toBeInTheDocument();
    });

    // Submit the form
    const saveButton = screen.getByRole("button", { name: /Guardar/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(routesApi.update).toHaveBeenCalled();
    });

    // gpx_file_id IS included in payload (null for routes without GPX)
    const payload = vi.mocked(routesApi.update).mock.calls[0][1];
    expect(payload).toHaveProperty("gpx_file_id", null);
  });

  it("preserves other form fields when saving (no data loss)", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    vi.mocked(routesApi.update).mockResolvedValue(mockRoute);
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByLabelText("Editar Coastal Loop"));
    await waitFor(() => {
      expect(screen.getByText("Editar ruta")).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: /Guardar/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(routesApi.update).toHaveBeenCalled();
    });

    const payload = vi.mocked(routesApi.update).mock.calls[0][1];
    // Title, route_type, difficulty should be preserved
    expect(payload).toHaveProperty("title", "Coastal Loop");
    expect(payload).toHaveProperty("route_type", "walking");
    expect(payload).toHaveProperty("difficulty", "moderate");
    // M2M arrays should be present
    expect(payload).toHaveProperty("tag_ids");
    expect(payload).toHaveProperty("gallery_ids");
    expect(payload).toHaveProperty("attachments_ids");
  });
});

describe("RouteDialog - GPX Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls generateGpx API when Generate button is clicked", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    vi.mocked(routesApi.generateGpx).mockResolvedValue(mockRouteWithGpx);
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });

    // Open edit dialog
    await userEvent.click(screen.getByLabelText("Editar Coastal Loop"));
    await waitFor(() => {
      expect(screen.getByText("Editar ruta")).toBeInTheDocument();
    });

    // Switch to Media & Extras tab
    const mediaTabTrigger = screen.getByText("Media & Extras");
    await userEvent.click(mediaTabTrigger);

    // Click Generate GPX
    await waitFor(() => {
      expect(screen.getByText(/Generar/i)).toBeInTheDocument();
    });
    const generateBtn = screen.getByText(/Generar/i).closest("button")!;
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(routesApi.generateGpx).toHaveBeenCalledWith("coastal-loop");
    });
  });

  it("submit after GPX generation includes gpx_file_id with correct value", async () => {
    vi.mocked(routesApi.getAll).mockResolvedValue([mockRoute]);
    vi.mocked(routesApi.generateGpx).mockResolvedValue(mockRouteWithGpx);
    vi.mocked(routesApi.update).mockResolvedValue(mockRouteWithGpx);
    render(<RoutesPage />);

    await waitFor(() => {
      expect(screen.getByText("Coastal Loop")).toBeInTheDocument();
    });

    // Open edit dialog
    await userEvent.click(screen.getByLabelText("Editar Coastal Loop"));
    await waitFor(() => {
      expect(screen.getByText("Editar ruta")).toBeInTheDocument();
    });

    // Go to media tab and generate GPX
    await userEvent.click(screen.getByText("Media & Extras"));
    await waitFor(() => {
      expect(screen.getByText(/Generar/i)).toBeInTheDocument();
    });
    const generateBtn = screen.getByText(/Generar/i).closest("button")!;
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(routesApi.generateGpx).toHaveBeenCalled();
    });

    // Now save the form
    const saveButton = screen.getByRole("button", { name: /Guardar/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(routesApi.update).toHaveBeenCalled();
    });

    // CRITICAL: gpx_file_id MUST be in PATCH with the generated GPX ID
    const payload = vi.mocked(routesApi.update).mock.calls[0][1];
    expect(payload).toHaveProperty("gpx_file_id", 55);
  });
});
