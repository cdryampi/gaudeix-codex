import { render, screen, waitFor } from "@/tests/test-utils";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import { mockSocialLinks } from "@/tests/fixtures/crudData";
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

describe("SocialLinksPage CRUD", () => {
  beforeEach(() => {
    (socialLinksApi.getAll as Mock).mockResolvedValue([...mockSocialLinks]);
  });

  it("renders social links and fetches data", async () => {
    render(<SocialLinksPage />);

    expect(
      screen.getByRole("heading", { name: /enlaces sociales/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    expect(await screen.findByText("Facebook")).toBeInTheDocument();

    expect(socialLinksApi.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Instagram")).toBeInTheDocument();
  });

  it("deletes a social link and refetches list", async () => {
    (socialLinksApi.delete as Mock).mockResolvedValue({});

    render(<SocialLinksPage />);
    expect(await screen.findByText("Facebook")).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);

    const confirmButton = await screen.findByRole("button", {
      name: /^Eliminar$/,
    });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(socialLinksApi.delete).toHaveBeenCalledWith(1);
      expect(socialLinksApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
