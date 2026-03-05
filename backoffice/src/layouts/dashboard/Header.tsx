/**
 * Dashboard header with Flowbite React
 */
import { Tooltip, Avatar } from "flowbite-react";
import { useAuth } from "@/app/providers/useAuth";
import { useTheme } from "@/app/providers/useTheme";
import { LogOut, Moon, Sun, Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950/90 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-72 rounded-md border border-slate-200 bg-slate-50 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-500 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Tooltip content="Notificaciones">
          <button className="relative rounded-md p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-secondary-500 ring-2 ring-white dark:ring-slate-900"></span>
          </button>
        </Tooltip>

        <Tooltip content={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </Tooltip>

        <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {user?.username || "Usuario"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administrador
            </p>
          </div>

          <div className="group relative">
            <Avatar
              rounded
              size="sm"
              placeholderInitials={(user?.username || "U")
                .substring(0, 2)
                .toUpperCase()}
              className="cursor-pointer transition-transform hover:scale-105"
            />

            <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 translate-y-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
