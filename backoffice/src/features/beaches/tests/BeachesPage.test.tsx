import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, waitFor } from "@/tests/test-utils";
import { BeachesPage } from "../pages/BeachesPage";

vi.mock("../api/beaches", () => ({
  beachesApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/components/common", () => ({
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  PageHeader: ({
    title,
    description,
    actions,
  }: {
    title: string;
    description?: string;
    actions?: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {actions}
    </div>
  ),
}));

vi.mock("../components/BeachDialog", () => ({
  BeachDialog: ({
    open,
    onSubmit,
  }: {
    open: boolean;
    onSubmit: (payload: unknown) => Promise<void>;
  }) =>
    open ? (
      <div>
        <p>Beach dialog abierto</p>
        <button
          type="button"
          onClick={() =>
            void onSubmit({
              title: "Platja Nova",
              beach_type: "urban",
              is_published: true,
              gallery_ids: [],
              recommended_for: [],
              services: {},
              accessibility_features: {},
            })
          }
        >
          Guardar playa mock
        </button>
      </div>
    ) : null,
}));

const { beachesApi } = await import("../api/beaches");

const mockBeaches = [
  {
    id: 1,
    slug: "platja-dels-vinyals",
    title: "Platja dels Vinyals",
    description: "Arena amplia",
    location_text: "Passeig Marítim",
    latitude: 41.5,
    longitude: 2.4,
    is_published: true,
    beach_type: "urban" as const,
    environment_summary: "Familiar",
    recommended_for: ["families"] as const,
    services: { showers: true },
    accessibility_features: { accessible_access: true },
    gallery: [],
    attachments: [],
  },
  {
    id: 2,
    slug: "platja-de-les-senies",
    title: "Platja de les Senies",
    description: "Tramo abierto",
    location_text: "Zona norte",
    latitude: 41.51,
    longitude: 2.41,
    is_published: false,
    beach_type: "natural" as const,
    environment_summary: "Más tranquila",
    recommended_for: ["quiet_visit"] as const,
    services: {},
    accessibility_features: {},
    gallery: [],
    attachments: [],
  },
];

describe("BeachesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (beachesApi.getAll as Mock).mockResolvedValue([...mockBeaches]);
  });

  it("renders beaches, the coastal badge, and filters by search", async () => {
    const user = userEvent.setup();

    render(<BeachesPage />);

    expect(
      screen.getByRole("heading", { name: "Playas", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Costa")).toBeInTheDocument();
    expect(await screen.findByText("Platja dels Vinyals")).toBeInTheDocument();
    expect(screen.getByText("Platja de les Senies")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Buscar playas..."), "senies");

    expect(screen.queryByText("Platja dels Vinyals")).not.toBeInTheDocument();
    expect(screen.getByText("Platja de les Senies")).toBeInTheDocument();
  });

  it("creates a beach and refetches the list", async () => {
    const user = userEvent.setup();
    (beachesApi.create as Mock).mockResolvedValue({
      ...mockBeaches[0],
      id: 3,
      slug: "platja-nova",
      title: "Platja Nova",
    });
    (beachesApi.getAll as Mock)
      .mockResolvedValueOnce([...mockBeaches])
      .mockResolvedValueOnce([
        ...mockBeaches,
        {
          ...mockBeaches[0],
          id: 3,
          slug: "platja-nova",
          title: "Platja Nova",
        },
      ]);

    render(<BeachesPage />);

    expect(await screen.findByText("Platja dels Vinyals")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /nueva playa/i }));
    expect(screen.getByText("Beach dialog abierto")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /guardar playa mock/i }),
    );

    await waitFor(() => {
      expect(beachesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Platja Nova",
          beach_type: "urban",
        }),
      );
      expect(beachesApi.getAll).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Platja Nova")).toBeInTheDocument();
  });

  it("deletes a beach and reloads the table", async () => {
    const user = userEvent.setup();
    (beachesApi.delete as Mock).mockResolvedValue(undefined);
    (beachesApi.getAll as Mock)
      .mockResolvedValueOnce([...mockBeaches])
      .mockResolvedValueOnce([mockBeaches[1]]);

    render(<BeachesPage />);

    expect(await screen.findByText("Platja dels Vinyals")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /eliminar platja dels vinyals/i }),
    );
    await user.click(screen.getByRole("button", { name: /^Eliminar$/ }));

    await waitFor(() => {
      expect(beachesApi.delete).toHaveBeenCalledWith("platja-dels-vinyals");
      expect(beachesApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
