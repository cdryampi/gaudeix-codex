import { describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { render, screen } from "@/tests/test-utils";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { AuthLayout } from "../components/AuthLayout";

describe("Auth Feature", () => {
  describe("AuthLayout", () => {
    it("renders children via outlet", () => {
      render(
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/test" element={<h1>Child Content</h1>} />
          </Route>
        </Routes>,
        { router: { type: "memory", initialEntries: ["/test"] } },
      );

      expect(
        screen.getByRole("heading", { name: "Child Content" }),
      ).toBeInTheDocument();
    });
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/usuario o email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("renders register form", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /registrarse/i }),
    ).toBeInTheDocument();
  });

  it("renders reset password form", () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar instrucciones/i }),
    ).toBeInTheDocument();
  });
});
