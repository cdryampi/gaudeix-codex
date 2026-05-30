import { Link } from "react-router-dom";
import { Home, RefreshCw } from "lucide-react";

export function ErrorPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50">
              <span className="text-6xl">😵</span>
            </div>
            <span className="absolute -bottom-2 -right-2 text-7xl font-black text-red-200/60 select-none">
              500
            </span>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Error interno del servidor
        </h1>
        <p className="mb-8 text-lg text-slate-600">
          Algo salió mal. Nuestro equipo ya ha sido notificado. Por favor,
          inténtalo de nuevo más tarde.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    </main>
  );
}
