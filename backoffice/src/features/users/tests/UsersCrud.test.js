import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  PageContainer: ({ children }) => _jsx("div", { children: children }),
  PageHeader: ({ title, actions }) =>
    _jsxs("div", { children: [_jsx("h1", { children: title }), actions] }),
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
    usersApi.getAll.mockResolvedValue(MOCK_USERS);
  });
  it("renders the users page and fetches users", async () => {
    render(_jsx(UsersPage, {}));
    expect(
      screen.getByRole("heading", { name: "Usuarios", level: 1 }),
    ).toBeInTheDocument();
    await screen.findByText("Admin User");
    expect(usersApi.getAll).toHaveBeenCalled();
    expect(screen.getByText("admin@gaudeix.com")).toBeInTheDocument();
  });
  it("can delete a user", async () => {
    usersApi.delete.mockResolvedValue({});
    render(_jsx(UsersPage, {}));
    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });
    // Find the delete button for the first user
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    const deleteBtn = deleteButtons[0];
    // Click delete button to open AlertDialog
    fireEvent.click(deleteBtn);
    // Wait for confirmation dialog to appear
    await waitFor(() => {
      expect(screen.getByText(/¿Estás seguro/i)).toBeInTheDocument();
    });
    // Find and click the confirmation button by its text content
    const confirmButton = screen.getByRole("button", { name: /^Eliminar$/ });
    fireEvent.click(confirmButton);
    // Should call delete API
    await waitFor(() => {
      expect(usersApi.delete).toHaveBeenCalledWith(1);
    });
    // Should refetch users
    await waitFor(() => {
      expect(usersApi.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
