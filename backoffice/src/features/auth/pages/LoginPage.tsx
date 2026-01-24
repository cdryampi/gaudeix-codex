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
import { LogIn, AlertCircle, ArrowRight, Lock } from "lucide-react";
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
          message ?? "Error al iniciar sesión. Verifica tus credenciales."
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">
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
            <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Usuario o Email</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="nombre@ejemplo.com"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="username"
              className="bg-white"
            />
            {errors.username && (
              <p className="text-sm text-red-500 font-medium">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Contraseña</Label>
              <Link
                to="/reset-password"
                className="text-xs font-medium text-primary-600 hover:text-primary-500 hover:underline dark:text-primary-400"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                autoComplete="current-password"
                className="bg-white pr-10"
              />
              <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 font-medium">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
           <Switch
             id="remember"
             checked={formData.remember}
             onCheckedChange={handleRememberChange}
           />
           <Label htmlFor="remember" className="font-normal text-gray-600 dark:text-gray-400">Mantener sesión iniciada</Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            "Verificando..."
          ) : (
            <span className="flex items-center gap-2">
              Iniciar Sesión <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>¿No tienes acceso? <span className="text-primary-600 font-medium">Contacta al administrador</span></p>
      </div>
    </div>
  );
};
