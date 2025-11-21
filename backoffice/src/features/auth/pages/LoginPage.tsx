import { z } from "zod";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "../components/AuthCard";
import { useAuthForm } from "../hooks/useAuthForm";
import { LOGIN_URL } from "@/config/env";
import { UserPlus, KeyRound } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const LoginPage = () => {
  const { values, errors, isSubmitting, handleChange, handleSubmit } =
    useAuthForm({
      schema: loginSchema,
      defaultValues: { email: "", password: "" },
      onSubmit: async (data) => {
        console.log("Login attempt:", data);
        console.log("Target URL:", LOGIN_URL);
        // Placeholder for actual login logic
      },
    });

  return (
    <AuthCard
      title="Bienvenido"
      subtitle="Accede a tu cuenta"
      footer={
        <div className="space-y-3 w-full">
          <Link
            to="/register"
            className="group flex items-center justify-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-primary transition-all duration-200 font-medium"
          >
            <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>
              ¿No tienes cuenta?{" "}
              <span className="underline decoration-2 underline-offset-4 decoration-neutral-300 dark:decoration-neutral-700 group-hover:decoration-primary">
                Regístrate
              </span>
            </span>
          </Link>
          <Link
            to="/reset-password"
            className="group flex items-center justify-center gap-2 text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all duration-200 text-sm"
          >
            <KeyRound className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span className="group-hover:underline underline-offset-4">
              Olvidé mi contraseña
            </span>
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={values.email}
            onChange={handleChange}
            className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1.5">{errors.email}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1.5">{errors.password}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full h-10 sm:h-11 text-base font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cargando..." : "Ingresar"}
        </Button>
      </form>
    </AuthCard>
  );
};
