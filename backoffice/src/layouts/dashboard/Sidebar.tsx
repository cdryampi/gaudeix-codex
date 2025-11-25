import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Image, Calendar, Share2 } from "lucide-react";
import { ROUTES } from "@/lib/config/constants";

const navigation = [
  { name: "Dashboard", href: ROUTES.DASHBOARD_HOME, icon: LayoutDashboard },
  { name: "Usuarios", href: ROUTES.USERS, icon: Users },
  { name: "Media", href: ROUTES.MEDIA, icon: Image },
  { name: "Eventos", href: ROUTES.EVENTS, icon: Calendar },
  { name: "Social", href: ROUTES.SOCIAL, icon: Share2 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">Gaudeix</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700" />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-400">admin@gaudeix.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
