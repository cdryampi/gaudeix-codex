import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Register } from "./Register";
import { useAuthStore } from "../store";

// Mock the store
vi.mock("../store", () => ({
  useAuthStore: vi.fn(),
}));

describe("Register Component", () => {
  const mockRegister = vi.fn();
  const mockToggleLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        register: mockRegister,
        isLoading: false,
        error: null,
      })
    );
  });

  it("renders register form correctly", () => {
    render(<Register onToggleLogin={mockToggleLogin} />);

    expect(screen.getByLabelText(/Nombre de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it("calls register function on submit", async () => {
    render(<Register onToggleLogin={mockToggleLogin} />);

    fireEvent.change(screen.getByLabelText(/Nombre de usuario/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    expect(mockRegister).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
      name: "New User",
      password: "password123",
      password_confirm: "password123",
    });
  });

  it("shows error if passwords do not match", async () => {
    render(<Register onToggleLogin={mockToggleLogin} />);

    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), {
      target: { value: "password456" },
    });

    expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear cuenta/i })).toBeDisabled();
  });
});
