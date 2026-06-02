import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/providers/useAuth";
import { ROUTES } from "@/lib/config/constants";
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Alert } from "flowbite-react";

const loginSchema = z.object({
  username: z.string().min(1, "El usuario o email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormData = z.infer<typeof loginSchema> & { remember: boolean };

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    remember: true,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});
  const [loginError, setLoginError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (loginError) setLoginError("");
  };

  const handleRememberChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, remember: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        const formattedErrors: Partial<Record<keyof LoginFormData, string>> =
          {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof LoginFormData] = err.message;
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

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Bienvenido de nuevo
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
        {loginError && (
          <Alert color="failure" icon={AlertCircle}>
            <span className="font-medium">Error de acceso:</span> {loginError}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-gray-700 dark:text-gray-300"
            >
              Usuario o Email
            </Label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="nombre@ejemplo.com"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
            />
            {errors.username && (
              <p className="text-sm text-red-500 font-medium mt-1">
                {errors.username}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-gray-700 dark:text-gray-300"
              >
                Contraseña
              </Label>
              <Link
                to="/reset-password"
                className="text-xs font-medium text-primary-600 hover:text-primary-500 hover:underline dark:text-primary-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative flex items-center w-full">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
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
        </div>

        <label
          htmlFor="remember"
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <input
            type="checkbox"
            id="remember"
            checked={formData.remember}
            onChange={(e) => handleRememberChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 accent-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors">
            Mantener sesión iniciada
          </span>
        </label>

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-semibold text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            "Verificando..."
          ) : (
            <span className="flex items-center justify-center gap-2">
              Iniciar Sesión <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          ¿No tienes acceso?{" "}
          <span className="text-primary-600 font-medium hover:underline cursor-pointer">
            Contacta al administrador
          </span>
        </p>
      </div>
    </div>
  );
};
