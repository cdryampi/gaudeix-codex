/**
 * Dashboard sidebar with Flowbite React
 */
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Tag,
  FolderOpen,
  MessageSquare,
  Users,
  Image,
  Settings,
  FileStack,
  Video,
  Menu,
  PanelsTopLeft,
  Bot,
  MapPin,
  Waves,
  Clock3,
  LucideIcon,
  Send,
  Route,
  PartyPopper,
  Newspaper,
  Download,
} from "lucide-react";
import { ROUTES } from "@/lib/config/constants";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const panelNavigation: NavItem[] = [
  { name: "Resumen", href: ROUTES.DASHBOARD_HOME, icon: LayoutDashboard },
];

const contentNavigation: NavItem[] = [
  { name: "Noticias", href: ROUTES.NEWS, icon: Newspaper },
  { name: "Scraper", href: ROUTES.SCRAPER, icon: Download },
  { name: "Eventos", href: ROUTES.EVENTS, icon: FileText },
  { name: "Lugares", href: ROUTES.PLACES, icon: MapPin },
  { name: "Playas", href: ROUTES.BEACHES, icon: Waves },
  { name: "Automatizaciones", href: ROUTES.AUTOMATIONS, icon: Clock3 },
  { name: "Rutas", href: ROUTES.ROUTES_HIKING, icon: Route },
  { name: "Festes", href: ROUTES.FESTES, icon: PartyPopper },
  { name: "Categorías", href: ROUTES.CATEGORIES, icon: FolderOpen },
  { name: "Comentarios", href: "/comentarios", icon: MessageSquare },
];

const marketingNavigation: NavItem[] = [
  { name: "Notificaciones", href: "/dashboard/notifications", icon: Send },
];

const mediaNavigation: NavItem[] = [
  { name: "Media", href: ROUTES.MEDIA, icon: Image },
];

const systemNavigation: NavItem[] = [
  { name: "Usuarios", href: ROUTES.USERS, icon: Users },
  { name: "Páginas estáticas", href: ROUTES.STATIC_PAGES, icon: FileStack },
  { name: "Site settings", href: ROUTES.SITE_SETTINGS, icon: Settings },
  { name: "Video", href: ROUTES.VIDEO_SETTINGS, icon: Video },
  { name: "Header", href: ROUTES.HEADER_MENU, icon: Menu },
  { name: "Footer", href: ROUTES.FOOTER_SETTINGS, icon: PanelsTopLeft },
  { name: "Redes sociales", href: ROUTES.SOCIAL, icon: Tag },
  { name: "LLM", href: ROUTES.LLM_SETTINGS, icon: Bot },
];

export function Sidebar() {
  const location = useLocation();

  const NavSection = ({
    title,
    items,
  }: {
    title?: string;
    items: NavItem[];
  }) => (
    <div className="mb-6">
      {title && (
        <h3 className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
          {title}
        </h3>
      )}
      <div className="space-y-1 px-2">
        {items.map((item) => {
          const isActive =
            location.pathname === item.href ||
            location.pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-primary-50 text-primary-800 ring-1 ring-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:ring-primary-900"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-primary-700 dark:text-primary-300"
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="flex h-screen w-[264px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors duration-200">
      <div className="flex h-20 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2 dark:border-primary-900 dark:bg-primary-950/40">
          <span className="text-sm font-semibold tracking-[0.08em] text-primary-800 dark:text-primary-300">
            GAUDEIX CODEx
          </span>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto py-6">
        <NavSection title="Dashboard" items={panelNavigation} />
        <NavSection title="Gestión de Contenido" items={contentNavigation} />
        <NavSection title="Marketing" items={marketingNavigation} />
        <NavSection title="Media" items={mediaNavigation} />
        <NavSection
          title="Configuración del Sistema"
          items={systemNavigation}
        />
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">
            Estado del Sistema
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary-500" />
            <span className="text-[11px]">Todos los servicios operativos</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
