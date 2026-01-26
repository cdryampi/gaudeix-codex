import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";
import { Alert } from "flowbite-react";
const loginSchema = z.object({
  username: z.string().min(1, "El usuario o email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (loginError) setLoginError("");
  };
  const handleRememberChange = (checked) => {
    setFormData((prev) => ({ ...prev, remember: checked }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setErrors({});
    setLoginError("");
    try {
      const validatedData = loginSchema.parse(formData);
      await login({
        username: validatedData.username,
        password: validatedData.password,
      });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        const message = error instanceof Error ? error.message : null;
        setLoginError(
          message ?? "Error al iniciar sesión. Verifica tus credenciales.",
        );
      }
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);
  return _jsxs("div", {
    className: "w-full space-y-6 animate-in fade-in duration-500",
    children: [
      _jsxs("div", {
        className: "space-y-2 text-center",
        children: [
          _jsx("h2", {
            className:
              "text-xl font-semibold tracking-tight text-gray-900 dark:text-white",
            children: "Bienvenido de nuevo",
          }),
          _jsx("p", {
            className: "text-sm text-gray-500 dark:text-gray-400",
            children: "Ingresa tus credenciales para acceder",
          }),
        ],
      }),
      _jsxs("form", {
        onSubmit: handleSubmit,
        className: "space-y-5",
        autoComplete: "on",
        children: [
          loginError &&
            _jsxs(Alert, {
              color: "failure",
              icon: AlertCircle,
              children: [
                _jsx("span", {
                  className: "font-medium",
                  children: "Error de acceso:",
                }),
                " ",
                loginError,
              ],
            }),
          _jsxs("div", {
            className: "space-y-4",
            children: [
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsx(Label, {
                    htmlFor: "username",
                    className: "text-gray-700 dark:text-gray-300",
                    children: "Usuario o Email",
                  }),
                  _jsx(Input, {
                    id: "username",
                    name: "username",
                    type: "text",
                    placeholder: "nombre@ejemplo.com",
                    value: formData.username,
                    onChange: handleChange,
                    disabled: isLoading,
                    autoComplete: "username",
                    className: "bg-white",
                  }),
                  errors.username &&
                    _jsx("p", {
                      className: "text-sm text-red-500 font-medium",
                      children: errors.username,
                    }),
                ],
              }),
              _jsxs("div", {
                className: "space-y-2",
                children: [
                  _jsxs("div", {
                    className: "flex items-center justify-between",
                    children: [
                      _jsx(Label, {
                        htmlFor: "password",
                        className: "text-gray-700 dark:text-gray-300",
                        children: "Contrase\u00F1a",
                      }),
                      _jsx(Link, {
                        to: "/reset-password",
                        className:
                          "text-xs font-medium text-primary-600 hover:text-primary-500 hover:underline dark:text-primary-400",
                        children: "\u00BFOlvidaste tu contrase\u00F1a?",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "relative",
                    children: [
                      _jsx(Input, {
                        id: "password",
                        name: "password",
                        type: "password",
                        placeholder:
                          "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                        value: formData.password,
                        onChange: handleChange,
                        disabled: isLoading,
                        autoComplete: "current-password",
                        className: "bg-white pr-10",
                      }),
                      _jsx(Lock, {
                        className:
                          "absolute right-3 top-3 h-4 w-4 text-gray-400",
                      }),
                    ],
                  }),
                  errors.password &&
                    _jsx("p", {
                      className: "text-sm text-red-500 font-medium",
                      children: errors.password,
                    }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "flex items-center space-x-2",
            children: [
              _jsx(Switch, {
                id: "remember",
                checked: formData.remember,
                onCheckedChange: handleRememberChange,
              }),
              _jsx(Label, {
                htmlFor: "remember",
                className: "font-normal text-gray-600 dark:text-gray-400",
                children: "Mantener sesi\u00F3n iniciada",
              }),
            ],
          }),
          _jsx(Button, {
            type: "submit",
            className: "w-full",
            size: "lg",
            disabled: isLoading,
            children: isLoading
              ? "Verificando..."
              : _jsxs("span", {
                  className: "flex items-center gap-2",
                  children: [
                    "Iniciar Sesi\u00F3n ",
                    _jsx(ArrowRight, { className: "h-4 w-4" }),
                  ],
                }),
          }),
        ],
      }),
      _jsx("div", {
        className: "mt-8 text-center text-sm text-gray-500 dark:text-gray-400",
        children: _jsxs("p", {
          children: [
            "\u00BFNo tienes acceso? ",
            _jsx("span", {
              className: "text-primary-600 font-medium",
              children: "Contacta al administrador",
            }),
          ],
        }),
      }),
    ],
  });
};
