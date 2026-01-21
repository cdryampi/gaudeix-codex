import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Image as ImageIcon,
  FileText,
  FolderOpen,
  Settings,
  X,
  MapPin,
  Tag,
  Bot,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthProvider";
import { ROUTES } from "@/lib/config/constants";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop?: boolean;
}

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Resumen", path: ROUTES.DASHBOARD_HOME },
  { icon: Users, label: "Usuarios", path: ROUTES.USERS },
  { icon: Calendar, label: "Eventos", path: ROUTES.EVENTS },
  { icon: MapPin, label: "Lugares", path: ROUTES.PLACES },
  { icon: ImageIcon, label: "Media", path: ROUTES.MEDIA },
  { icon: FolderOpen, label: "Categorías", path: ROUTES.CATEGORIES },
  { icon: FileText, label: "Páginas", path: ROUTES.STATIC_PAGES },
  { icon: Settings, label: "Ajustes del sitio", path: ROUTES.SITE_SETTINGS },
  { icon: Tag, label: "Redes sociales", path: ROUTES.SOCIAL },
  { icon: Bot, label: "LLM", path: ROUTES.LLM_SETTINGS },
];

export function Sidebar({ isOpen, onClose, isDesktop = false }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    if (isDesktop || !isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isDesktop, isOpen]);

  const isVisible = isDesktop || isOpen;

  return (
    <>
      {/* Mobile Overlay */}
      {!isDesktop && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "z-50 w-64 shrink-0 transform bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out",
          isDesktop ? "sticky top-0 h-screen" : "fixed inset-y-0 left-0",
          isVisible ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Gaudeix
              </span>
            </Link>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
            {MENU_ITEMS.map((item) => {
              const isActive =
                item.path === ROUTES.DASHBOARD_HOME
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => {
                    if (!isDesktop) {
                      onClose();
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
