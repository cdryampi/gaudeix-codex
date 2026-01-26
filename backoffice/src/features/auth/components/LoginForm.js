import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Login form component using Flowbite React
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { useAuth } from "@/hooks/useAuth";
const formSchema = z.object({
  username: z.string().min(1, "El usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  async function onSubmit(values) {
    setIsLoading(true);
    setError(null);
    try {
      await login(values);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      } else {
        setError("Error al conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }
  return _jsxs("div", {
    className: "w-full max-w-sm space-y-6",
    children: [
      _jsxs("div", {
        className: "space-y-2 text-center",
        children: [
          _jsx("h1", {
            className: "text-3xl font-bold",
            children: "Bienvenido",
          }),
          _jsx("p", {
            className: "text-gray-500 dark:text-gray-400",
            children: "Ingresa tus credenciales para acceder al panel",
          }),
        ],
      }),
      error &&
        _jsx(Alert, {
          color: "failure",
          className: "mb-4",
          children: _jsx("span", { children: error }),
        }),
      _jsxs("form", {
        onSubmit: handleSubmit(onSubmit),
        className: "space-y-4",
        children: [
          _jsxs("div", {
            children: [
              _jsx("div", {
                className: "mb-2 block",
                children: _jsx(Label, {
                  htmlFor: "username",
                  children: "Usuario",
                }),
              }),
              _jsx(TextInput, {
                id: "username",
                type: "text",
                placeholder: "admin",
                ...register("username"),
                color: errors.username ? "failure" : "gray",
              }),
              errors.username &&
                _jsx("p", {
                  className: "mt-1 text-sm text-red-600 dark:text-red-500",
                  children: errors.username.message,
                }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsx("div", {
                className: "mb-2 block",
                children: _jsx(Label, {
                  htmlFor: "password",
                  children: "Contrase\u00F1a",
                }),
              }),
              _jsx(TextInput, {
                id: "password",
                type: "password",
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                ...register("password"),
                color: errors.password ? "failure" : "gray",
              }),
              errors.password &&
                _jsx("p", {
                  className: "mt-1 text-sm text-red-600 dark:text-red-500",
                  children: errors.password.message,
                }),
            ],
          }),
          _jsxs(Button, {
            type: "submit",
            className: "w-full",
            disabled: isLoading,
            color: "primary",
            children: [
              isLoading &&
                _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Iniciar Sesi\u00F3n",
            ],
          }),
        ],
      }),
    ],
  });
}
