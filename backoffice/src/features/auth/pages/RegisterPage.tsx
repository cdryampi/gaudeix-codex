import { useState } from "react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "../hooks/useAuthForm";
import { LogIn, Eye, EyeOff } from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    repeat_password: z.string(),
  })
  .refine((data) => data.password === data.repeat_password, {
    message: "Las contraseñas no coinciden",
    path: ["repeat_password"],
  });

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      schema: registerSchema,
      defaultValues: { email: "", password: "", repeat_password: "" },
      onSubmit: async () => {
        // Placeholder for actual register logic
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
    });

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Crear Cuenta
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Únete a nosotros
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
            Correo electrónico
          </Label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={handleChange}
            disabled={isSubmitting}
            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
          />
          {errors.email && (
            <p className="text-sm text-red-500 font-medium mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-gray-700 dark:text-gray-300"
          >
            Contraseña
          </Label>
          <div className="relative flex items-center w-full">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={values.password}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 font-medium mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Repeat Password Field */}
        <div className="space-y-2">
          <Label
            htmlFor="repeat_password"
            className="text-gray-700 dark:text-gray-300"
          >
            Confirmar Contraseña
          </Label>
          <div className="relative flex items-center w-full">
            <input
              id="repeat_password"
              name="repeat_password"
              type={showRepeatPassword ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={values.repeat_password}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
              className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              tabIndex={-1}
            >
              {showRepeatPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.repeat_password && (
            <p className="text-sm text-red-500 font-medium mt-1">
              {errors.repeat_password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold text-sm"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cargando..." : "Registrarse"}
        </Button>
      </form>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          to="/login"
          className="group inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <LogIn className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>
            ¿Ya tienes cuenta?{" "}
            <span className="underline decoration-1 underline-offset-4 group-hover:decoration-primary-500">
              Inicia sesión
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};
