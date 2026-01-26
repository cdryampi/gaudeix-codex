import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
  Calendar,
  Settings,
  FileStack,
  Video,
  Menu,
  Bot,
  MapPin,
} from "lucide-react";
import { ROUTES } from "@/lib/config/constants";
const panelNavigation = [
  { name: "Resumen", href: ROUTES.DASHBOARD_HOME, icon: LayoutDashboard },
];
const contentNavigation = [
  { name: "Events", href: ROUTES.EVENTS, icon: FileText },
  { name: "Categorías", href: ROUTES.CATEGORIES, icon: FolderOpen },
  { name: "Comentarios", href: "/comentarios", icon: MessageSquare },
];
const mediaNavigation = [
  { name: "Media", href: ROUTES.MEDIA, icon: Image },
  { name: "Eventos", href: "/eventos-calendario", icon: Calendar },
  { name: "Lugares", href: ROUTES.PLACES, icon: MapPin },
];
const systemNavigation = [
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
  const NavSection = ({ title, items }) =>
    _jsxs("div", {
      className: "mb-6",
      children: [
        title &&
          _jsx("h3", {
            className:
              "mb-2 px-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400",
            children: title,
          }),
        _jsx("div", {
          className: "space-y-0.5 px-2",
          children: items.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return _jsxs(
              Link,
              {
                to: item.href,
                className: `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300 shadow-sm ring-1 ring-primary-200 dark:ring-transparent"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                }`,
                children: [
                  _jsx(Icon, {
                    className: `h-5 w-5 shrink-0 transition-colors ${isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300"}`,
                  }),
                  item.name,
                ],
              },
              item.name,
            );
          }),
        }),
      ],
    });
  return _jsxs("aside", {
    className:
      "flex h-screen w-[260px] shrink-0 flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors duration-300",
    children: [
      _jsx("div", {
        className:
          "flex h-24 items-center justify-center border-b border-gray-100 px-6 dark:border-gray-800",
        children: _jsx("div", {
          className:
            "flex h-[3.75rem] w-[7.5rem] items-center justify-center rounded-lg bg-primary/10 p-2",
          children: _jsx("span", {
            className:
              "text-xl font-bold text-primary-600 dark:text-primary-400",
            children: "GAUDEIX",
          }),
        }),
      }),
      _jsxs("nav", {
        className: "custom-scrollbar flex-1 overflow-y-auto py-6",
        children: [
          _jsx(NavSection, { title: "Dashboard", items: panelNavigation }),
          _jsx(NavSection, {
            title: "Gesti\u00F3n de Contenido",
            items: contentNavigation,
          }),
          _jsx(NavSection, {
            title: "Media & Lugares",
            items: mediaNavigation,
          }),
          _jsx(NavSection, {
            title: "Configuraci\u00F3n del Sistema",
            items: systemNavigation,
          }),
        ],
      }),
      _jsx("div", {
        className: "border-t border-gray-100 p-4 dark:border-gray-800",
        children: _jsxs("div", {
          className:
            "rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400",
          children: [
            _jsx("p", {
              className: "font-medium text-gray-900 dark:text-gray-200",
              children: "Estado del Sistema",
            }),
            _jsxs("div", {
              className: "mt-2 flex items-center gap-2",
              children: [
                _jsxs("span", {
                  className: "relative flex h-2 w-2",
                  children: [
                    _jsx("span", {
                      className:
                        "absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75",
                    }),
                    _jsx("span", {
                      className:
                        "relative inline-flex h-2 w-2 rounded-full bg-green-500",
                    }),
                  ],
                }),
                _jsx("span", {
                  className: "text-[10px]",
                  children: "Todos los servicios operativos",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
