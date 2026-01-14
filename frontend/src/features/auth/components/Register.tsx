/**
 * Register Component
 *
 * User registration form with validation and Flowbite styling.
 */

import { useState } from "react";
import { Alert } from "flowbite-react";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuthStore } from "../store";

export function Register({ onToggleLogin }: { onToggleLogin: () => void }) {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        username,
        email,
        name,
        password,
        password_confirm: passwordConfirm,
      });
      toast.success("¡Cuenta creada con éxito!");
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Error al crear la cuenta.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Crear cuenta</h2>
        <p className="mt-2 text-sm text-gray-600">
          Únete a Gaudeix Cabrera de Mar
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
              Nombre de usuario
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario123"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
                required
                minLength={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-900">
              Nombre completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
              required
              disabled={isLoading}
            />
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
                minLength={8}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password_confirm" className="mb-2 block text-sm font-medium text-gray-900">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                id="password_confirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-puerto-rico-500 focus:ring-puerto-rico-500"
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            {password && passwordConfirm && password !== passwordConfirm && (
              <p className="mt-1 text-xs text-red-600">
                Las contraseñas no coinciden
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || password !== passwordConfirm}
          className="w-full rounded-lg bg-puerto-rico-500 px-5 py-3 text-center text-sm font-medium text-white hover:bg-puerto-rico-600 focus:outline-none focus:ring-4 focus:ring-puerto-rico-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onToggleLogin}
            className="font-medium text-puerto-rico-600 hover:text-puerto-rico-700"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </form>
    </div>
  );
}
