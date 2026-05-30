import { Link } from "react-router-dom";
import { Home, Frown } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-secondary-50">
              <Frown className="h-20 w-20 text-primary-300" />
            </div>
            <span className="absolute -bottom-2 -right-2 text-7xl font-black text-primary-200/60 select-none">
              404
            </span>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-slate-100">
          Página no encontrada
        </h1>
        <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
          La página que buscas no existe en el panel de administración.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-800"
        >
          <Home className="h-4 w-4" />
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
