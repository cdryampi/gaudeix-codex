import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@/tests/test-utils";
import { mockUsers } from "@/tests/fixtures/crudData";
import { UsersPage } from "../pages/UsersPage";
import { usersApi } from "../api/users";

vi.mock("../api/users", () => ({
  usersApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

describe("UsersPage CRUD", () => {
  beforeEach(() => {
    (usersApi.getAll as Mock).mockResolvedValue([...mockUsers]);
  });

  it("renders users and fetches initial list", async () => {
    render(<UsersPage />);

    expect(
      screen.getByRole("heading", { name: "Usuarios", level: 1 }),
    ).toBeInTheDocument();

    expect(await screen.findByText("Admin User")).toBeInTheDocument();
    expect(usersApi.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByText("admin@gaudeix.com")).toBeInTheDocument();
  });

  it("deletes a user and refetches list", async () => {
    (usersApi.delete as Mock).mockResolvedValue({});

    render(<UsersPage />);
    expect(await screen.findByText("Admin User")).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    await userEvent.click(deleteButtons[0]);

    const confirmButton = await screen.findByRole("button", {
      name: /^Eliminar$/,
    });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(usersApi.delete).toHaveBeenCalledWith(1);
      expect(usersApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
