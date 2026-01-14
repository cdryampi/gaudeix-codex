import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Tag,
  FolderOpen,
  MessageSquare,
  Users,
  Image,
  Calendar,
  Settings,
  FileStack,
  Video,
  Menu,
  Bot,
} from "lucide-react";
import { ROUTES } from "@/lib/config/constants";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const panelNavigation: NavItem[] = [{ name: "Resumen", href: ROUTES.DASHBOARD_HOME, icon: LayoutDashboard }];

const contentNavigation: NavItem[] = [
  { name: "Events", href: ROUTES.EVENTS, icon: FileText },
  { name: "Categorías", href: ROUTES.CATEGORIES, icon: FolderOpen },
  { name: "Comentarios", href: "/comentarios", icon: MessageSquare },
];

const mediaNavigation: NavItem[] = [
  { name: "Media", href: ROUTES.MEDIA, icon: Image },
  { name: "Eventos", href: "/eventos-calendario", icon: Calendar },
  { name: "Places", href: ROUTES.PLACES, icon: Calendar },
];

const systemNavigation: NavItem[] = [
  { name: "Usuarios", href: ROUTES.USERS, icon: Users },
  { name: "Páginas estáticas", href: ROUTES.STATIC_PAGES, icon: FileStack },
  { name: "Site settings", href: ROUTES.SITE_SETTINGS, icon: Settings },
  { name: "Video", href: ROUTES.VIDEO_SETTINGS, icon: Video },
  { name: "Header", href: ROUTES.HEADER_MENU, icon: Menu },
  { name: "Redes sociales", href: ROUTES.SOCIAL, icon: Tag },
  { name: "LLM", href: ROUTES.LLM_SETTINGS, icon: Bot },
];

export function Sidebar() {
  const location = useLocation();

  const NavSection = ({ title, items }: { title?: string; items: NavItem[] }) => (
    <div className="space-y-1">
      {title && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          {title}
        </h3>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">YA</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold leading-none text-sidebar-foreground">Backoffice</h1>
          <p className="text-xs text-muted-foreground">Panel editorial</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        <NavSection title="Panel" items={panelNavigation} />
        <NavSection title="Contenido" items={contentNavigation} />
        <NavSection title="Media & Eventos" items={mediaNavigation} />
        <NavSection title="Sistema" items={systemNavigation} />
      </nav>
    </aside>
  );
}
