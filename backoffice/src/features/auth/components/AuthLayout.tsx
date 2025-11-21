import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const AuthLayout = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-linear-to-br from-neutral-50 via-neutral-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 p-4 sm:p-6 lg:p-8 transition-colors duration-500">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(0,0,0,0))]" />

      {/* Logo Header */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <img
          src="/assets/img/logo-cabrera-white.png"
          alt="Gaudeix Logo"
          className="h-8 sm:h-10 w-auto opacity-90 dark:opacity-100 transition-opacity duration-300 hover:opacity-100 dark:invert-0 invert"
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Outlet />
      </div>
    </div>
  );
};
