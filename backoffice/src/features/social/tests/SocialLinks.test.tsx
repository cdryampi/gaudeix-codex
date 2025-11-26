import { render, screen, fireEvent, waitFor } from "@/tests/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SocialLinksPage } from "../pages/SocialLinksPage";
import { socialLinksApi } from "../api/socialLinks";

vi.mock("../api/socialLinks", () => ({
  socialLinksApi: {
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
    actions,
  }: {
    title: string;
    actions: React.ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

const MOCK_LINKS = [
  {
    id: 1,
    name: "Facebook",
    url: "https://facebook.com",
    icon_class: "fa-brands fa-facebook",
    color: "#3b5998",
    available_in_ca: true,
    available_in_es: true,
    available_in_en: true,
    available_in_fr: false,
    order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: "Instagram",
    url: "https://instagram.com",
    icon_class: "fa-brands fa-instagram",
    color: "#E1306C",
    available_in_ca: true,
    available_in_es: true,
    available_in_en: true,
    available_in_fr: false,
    order: 2,
    is_active: false,
  },
];

describe("SocialLinksPage CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (socialLinksApi.getAll as any).mockResolvedValue(MOCK_LINKS);
  });

  it("renders social links and fetches data", async () => {
    render(<SocialLinksPage />);

    expect(screen.getByText("Enlaces sociales")).toBeInTheDocument();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Facebook")).toBeInTheDocument();
    });

    expect(socialLinksApi.getAll).toHaveBeenCalled();
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("deletes a social link", async () => {
    (socialLinksApi.delete as any).mockResolvedValue({});

    render(<SocialLinksPage />);

    await waitFor(() => {
      expect(screen.getByText("Facebook")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });

    // Click delete button to open AlertDialog
    fireEvent.click(deleteButtons[0]);

    // Wait for confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro/i)).toBeInTheDocument();
    });

    // Find and click the confirmation button by its text content
    const confirmButton = screen.getByRole("button", { name: /^Eliminar$/ });
    fireEvent.click(confirmButton);

    // Should call delete API
    await waitFor(() => {
      expect(socialLinksApi.delete).toHaveBeenCalledWith(1);
    });

    // Should refetch after deletion
    await waitFor(() => {
      expect(socialLinksApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
