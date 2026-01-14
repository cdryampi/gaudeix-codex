import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * AuthLayout provides a centered, compact layout for authentication pages
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Header centrado con espacio alrededor */}
        <header className="mb-10 flex items-center justify-around">
          <div className="flex items-center gap-3">
            <img
              src="/assets/img/logo-cabrera-white.png"
              alt="Gaudeix"
              className="h-10 w-auto invert dark:invert-0"
            />
            <div>
              <h1 className="text-lg font-semibold">Gaudeix</h1>
              <p className="text-xs text-muted-foreground">Backoffice</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Card de login */}
        <div className="bg-card border rounded-xl shadow-lg p-6">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Gaudeix Municipal
        </p>
      </div>
    </div>
  );
};
