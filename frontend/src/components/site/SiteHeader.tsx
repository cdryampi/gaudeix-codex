import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Globe, Search, LogIn, User as UserIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { Dropdown, DropdownItem } from "flowbite-react";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";
import { useAuthStore } from "@/features/auth/store";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

function MegaMenuContent({ items }: { items: HeaderNavItem[] }) {
  const groups = items.filter((i) => i.children?.length);
  const links = items.filter((i) => !i.children?.length);

  return (
    <li className="w-[520px] max-w-[calc(100vw-2rem)] px-4 py-3">
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((group, groupIndex) => (
          <div key={`${group.label}-${groupIndex}`} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{group.label}</p>
            <ul className="space-y-1">
              {group.children!.map((child, childIndex) => (
                <li key={`${group.label}-${child.label}-${child.href ?? "group"}-${childIndex}`}>
                  <a
                    href={child.href || "#"}
                    className="block rounded-md px-2 py-1.5 text-sm text-text-secondary no-underline hover:bg-surface-hover hover:text-text-primary"
                  >
                    {child.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {links.length ? (
          <div className="space-y-1">
            {links.map((link, linkIndex) => (
              <a
                key={`${link.label}-${link.href ?? "#"}-${linkIndex}`}
                href={link.href || "#"}
                className="block rounded-md px-2 py-1.5 text-sm text-text-secondary no-underline hover:bg-surface-hover hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function SiteHeader({ siteName = "Gaudeix Cabrera de Mar" }: { siteName?: string }) {
  const navItems: HeaderNavItem[] = HEADER_NAV;
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("gaudeix_lang") || "es";
    } catch {
      return "es";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gaudeix_lang", language);
    } catch {
      // ignore
    }
  }, [language]);

  const languageLabel = useMemo(
    () => LANGUAGES.find((l) => l.code === language)?.label ?? "Español",
    [language]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border-light bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <a href="#inicio" className="flex items-center gap-2 text-text-primary no-underline hover:text-text-primary">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold tracking-tight">{siteName}</span>
        </a>

        <nav className="flex min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto text-sm font-medium md:justify-center md:gap-7">
          {navItems.map((item, itemIndex) => {
            if (item.children?.length) {
              const key = `${item.label}-group-${itemIndex}`;
              return (
                <Dropdown
                  key={key}
                  inline
                  arrowIcon={false}
                  placement="bottom-start"
                  renderTrigger={() => (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      aria-label={item.label}
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 opacity-70" />
                    </button>
                  )}
                >
                  <MegaMenuContent items={item.children} />
                </Dropdown>
              );
            }

            const key = `${item.label}-${item.href ?? "#"}-${itemIndex}`;
            return (
              <a
                key={key}
                href={item.href}
                className="rounded-md px-2 py-1.5 text-text-secondary no-underline hover:bg-surface-hover hover:text-text-primary"
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-text-tertiary transition-all hover:bg-background-light hover:text-primary md:inline-flex"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          <Dropdown
            inline
            arrowIcon={false}
            placement="bottom-end"
            renderTrigger={() => (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-text-tertiary transition-all hover:bg-background-light hover:text-primary"
                aria-label={`Idioma: ${languageLabel}`}
              >
                <Globe className="h-5 w-5" />
              </button>
            )}
          >
            {LANGUAGES.map((l) => (
              <DropdownItem key={l.code} onClick={() => {
                setLanguage(l.code);
                toast.success(`Idioma cambiado a ${l.label}`);
              }}>
                <div className="flex w-full items-center justify-between gap-3 px-1">
                  <span className="text-sm font-medium">{l.label}</span>
                  {language === l.code ? <Check className="h-4 w-4 text-primary" /> : null}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>

          <div className="mx-1 h-6 w-px bg-border-light" />

          {/* User Menu or Login Button */}
          {isAuthenticated ? (
            <Dropdown
              inline
              arrowIcon={false}
              placement="bottom-end"
              renderTrigger={() => (
                <button
                  type="button"
                  className="group flex h-10 items-center gap-2.5 rounded-xl border border-transparent bg-gray-50 p-1 pr-3 transition-all hover:border-border-light hover:bg-background-light/50"
                  aria-label="Menú de usuario"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white shadow-sm ring-2 ring-white transition-transform group-hover:scale-95">
                    {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="hidden max-w-[100px] truncate text-xs font-bold leading-tight text-text-primary md:block">
                      {user?.name || user?.username}
                    </span>
                    <span className="hidden text-[10px] font-medium leading-tight text-primary md:block">Mi cuenta</span>
                  </div>
                  <ChevronDown className="hidden h-3.5 w-3.5 text-text-tertiary transition-transform group-hover:translate-y-0.5 md:block" />
                </button>
              )}
            >
              <div className="px-4 py-3 text-sm text-text-primary border-b border-border-light">
                <div className="font-bold">{user?.name || user?.username}</div>
                <div className="truncate text-xs text-text-tertiary">{user?.email}</div>
              </div>
              <div className="p-1">
                <DropdownItem onClick={() => console.log("Navigate to profile")}>
                  <div className="flex items-center gap-2 py-1">
                    <UserIcon className="h-4 w-4 text-text-secondary" />
                    <span className="font-medium">Mi perfil</span>
                  </div>
                </DropdownItem>
                <DropdownItem onClick={() => {
                  logout();
                  toast.success("Has cerrado sesión");
                }}>
                  <div className="flex items-center gap-2 py-1 text-error">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3m2 4h6a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Cerrar sesión</span>
                  </div>
                </DropdownItem>
              </div>
            </Dropdown>
          ) : (
            <Link
              to="/login"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
              aria-label="Iniciar sesión"
            >
              <LogIn className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
