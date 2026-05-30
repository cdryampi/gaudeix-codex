import { Link } from "react-router-dom";
import { Home, RefreshCw } from "lucide-react";

export function ErrorPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30">
              <span className="text-6xl">😵</span>
            </div>
            <span className="absolute -bottom-2 -right-2 text-7xl font-black text-red-200/60 select-none">
              500
            </span>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Error interno
        </h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
          Algo salió mal. Inténtalo de nuevo.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-800"
          >
            <Home className="h-4 w-4" />
            Volver al dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
