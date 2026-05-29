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
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      await login(values);
      navigate("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      const status =
        err instanceof Error && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401) {
        setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      } else {
        setError("Error al conectar con el servidor. Inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Bienvenido</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Ingresa tus credenciales para acceder al panel
        </p>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          <span>{error}</span>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="username">Usuario</Label>
          </div>
          <TextInput
            id="username"
            type="text"
            placeholder="admin"
            {...register("username")}
            color={errors.username ? "failure" : "gray"}
            aria-invalid={!!errors.username || undefined}
          />
          {errors.username && (
            <p
              className="mt-1 text-sm text-red-600 dark:text-red-500"
              role="alert"
            >
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            color={errors.password ? "failure" : "gray"}
            aria-invalid={!!errors.password || undefined}
          />
          {errors.password && (
            <p
              className="mt-1 text-sm text-red-600 dark:text-red-500"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          color="primary"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Iniciar Sesión
        </Button>
      </form>
    </div>
  );
}
