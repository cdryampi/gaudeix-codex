import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Login } from "./Login";
import { useAuthStore } from "../store";

// Mock the store
vi.mock("../store", () => ({
  useAuthStore: vi.fn(),
}));

describe("Login Component", () => {
  const mockLogin = vi.fn();
  const mockToggleRegister = vi.fn();
  const mockTogglePasswordReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        login: mockLogin,
        isLoading: false,
        error: null,
      })
    );
  });

  it("renders login form correctly", () => {
    render(
      <Login
        onToggleRegister={mockToggleRegister}
        onTogglePasswordReset={mockTogglePasswordReset}
      />
    );

    expect(screen.getByLabelText(/Usuario o email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar sesión/i })).toBeInTheDocument();
  });

  it("calls login function on submit", async () => {
    render(
      <Login
        onToggleRegister={mockToggleRegister}
        onTogglePasswordReset={mockTogglePasswordReset}
      />
    );

    fireEvent.change(screen.getByLabelText(/Usuario o email/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    expect(mockLogin).toHaveBeenCalledWith("testuser", "password123");
  });

  it("displays error message when provided", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        login: mockLogin,
        isLoading: false,
        error: "Credenciales inválidas",
      })
    );

    render(
      <Login
        onToggleRegister={mockToggleRegister}
        onTogglePasswordReset={mockTogglePasswordReset}
      />
    );

    expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        login: mockLogin,
        isLoading: true,
        error: null,
      })
    );

    render(
      <Login
        onToggleRegister={mockToggleRegister}
        onTogglePasswordReset={mockTogglePasswordReset}
      />
    );

    expect(screen.getByRole("button", { name: /Iniciando sesión.../i })).toBeDisabled();
  });
});
