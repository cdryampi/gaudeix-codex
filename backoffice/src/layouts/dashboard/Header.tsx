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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
      {/* Left section: Breadcrumbs / Mobile Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar (Visual only for now) */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="h-9 w-64 rounded-full border-gray-200 bg-gray-50 pl-9 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <Tooltip content="Notificaciones">
          <button className="relative rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>
          </button>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip content={theme === "dark" ? "Modo claro" : "Modo oscuro"}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </Tooltip>

        <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
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

            {/* Simple Dropdown Stub (Flowbite Dropdown had issues with stubs) */}
            <div className="invisible absolute right-0 top-full mt-2 w-48 translate-y-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 z-50">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
