import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const AuthLayout = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-[#07090f] dark:via-[#0c1220] dark:to-[#0b1020] transition-colors duration-500">
      {/* Decorative background pattern behind content, no pointer interaction */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.12),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start !px-6 !py-10 gap-8">
        {/* Header inline to keep interactions stable */}
        <header className="w-full max-w-5xl flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/80 !px-5 !py-3 shadow-sm shadow-neutral-200/60 backdrop-blur-md transition-all duration-300 dark:border-border/70 dark:shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3">
            <img
              src="/assets/img/logo-cabrera-white.png"
              alt="Gaudeix Logo"
              className="h-9 w-auto drop-shadow-sm transition-opacity duration-200 invert dark:invert-0"
            />
            <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Gaudeix Backoffice
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="w-full max-w-[560px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
