import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersPage } from "../pages/UsersPage";
import { usersApi } from "../api/users";

// Mock the API
vi.mock("../api/users", () => ({
  usersApi: {
    getAll: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

// Mock the components that are not implemented yet or complex
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

const MOCK_USERS = [
  {
    id: 1,
    username: "admin",
    email: "admin@gaudeix.com",
    name: "Admin User",
    is_staff: true,
    is_active: true,
    date_joined: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "user",
    email: "user@gaudeix.com",
    name: "Regular User",
    is_staff: false,
    is_active: true,
    date_joined: "2023-01-02T00:00:00Z",
  },
];

describe("UsersPage CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usersApi.getAll as any).mockResolvedValue(MOCK_USERS);
  });

  it("renders the users page and fetches users", async () => {
    render(<UsersPage />);

    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    expect(usersApi.getAll).toHaveBeenCalled();
    expect(screen.getByText("admin@gaudeix.com")).toBeInTheDocument();
  });

  it("can delete a user", async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm");
    confirmSpy.mockImplementation(() => true);
    (usersApi.delete as any).mockResolvedValue({});

    render(<UsersPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    // Find the delete button for the first user
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    const deleteBtn = deleteButtons[0];

    fireEvent.click(deleteBtn);

    expect(confirmSpy).toHaveBeenCalled();
    expect(usersApi.delete).toHaveBeenCalledWith(1);

    // Should refetch users
    await waitFor(() => {
      expect(usersApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
