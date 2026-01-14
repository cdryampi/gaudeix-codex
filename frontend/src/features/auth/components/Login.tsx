/**
 * Login Component
 *
 * User login form with validation and Flowbite styling.
 */

import { useState } from "react";
import { Alert } from "flowbite-react";
import { Lock, User } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuthStore } from "../store";

export function Login({ onToggleRegister, onTogglePasswordReset }: {
  onToggleRegister: () => void;
  onTogglePasswordReset: () => void;
}) {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("¡Bienvenido de nuevo!");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Iniciar sesión</h2>
        <p className="mt-2 text-sm text-gray-600">
          Accede a tu cuenta de Gaudeix Cabrera de Mar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert color="failure" className="mb-6">
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-900">
              Usuario o email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Introduce tu usuario o email"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900">
              Contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-puerto-rico-500 px-5 py-3 text-center text-sm font-medium text-white hover:bg-puerto-rico-600 focus:outline-none focus:ring-4 focus:ring-puerto-rico-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onTogglePasswordReset}
            className="font-medium text-puerto-rico-600 hover:text-puerto-rico-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <button
            type="button"
            onClick={onToggleRegister}
            className="font-medium text-puerto-rico-600 hover:text-puerto-rico-700"
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  );
}
