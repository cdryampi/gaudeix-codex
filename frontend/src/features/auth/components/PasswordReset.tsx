/**
 * PasswordReset Component
 *
 * Password reset form for requesting reset email.
 */

import { useState } from "react";
import { Alert } from "flowbite-react";
import { ArrowLeft, Mail } from "lucide-react";

import { requestPasswordReset, formatApiError } from "../api";

export function PasswordReset({ onToggleLogin }: { onToggleLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset({ email });
      setSuccess(true);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 px-4 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Correo enviado!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Si existe una cuenta con el email {email}, recibirás un correo con las instrucciones para restablecer tu contraseña.
          </p>
        </div>
        <button
          onClick={onToggleLogin}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8 px-4 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Recuperar contraseña</h2>
        <p className="mt-2 text-sm text-gray-600">
          Introduce tu email y te enviaremos las instrucciones
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert color="failure" className="mb-6">
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-puerto-rico-500 px-5 py-3 text-center text-sm font-medium text-white hover:bg-puerto-rico-600 focus:outline-none focus:ring-4 focus:ring-puerto-rico-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Enviando..." : "Enviar instrucciones"}
        </button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onToggleLogin}
            className="inline-flex items-center gap-2 font-medium text-puerto-rico-600 hover:text-puerto-rico-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    </div>
  );
}
