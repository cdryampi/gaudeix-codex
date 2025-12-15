import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Globe, Search, Sparkles } from "lucide-react";

import { Dropdown, DropdownItem } from "flowbite-react";

import { HEADER_NAV, type HeaderNavItem } from "@/data/headerNav";

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
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{group.label}</p>
            <ul className="space-y-1">
              {group.children!.map((child) => (
                <li key={child.label}>
                  <a
                    href={child.href || "#"}
                    className="block rounded-md px-2 py-1.5 text-sm text-gray-700 no-underline hover:bg-gray-100 hover:text-gray-900"
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
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href || "#"}
                className="block rounded-md px-2 py-1.5 text-sm text-gray-700 no-underline hover:bg-gray-100 hover:text-gray-900"
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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center gap-6">
        <a href="#inicio" className="flex items-center gap-2 text-gray-900 no-underline hover:text-gray-900">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <span className="text-sm font-semibold tracking-tight">{siteName}</span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm font-medium md:flex">
          {HEADER_NAV.map((item) => {
            if (item.children?.length) {
              return (
                <Dropdown
                  key={item.label}
                  inline
                  arrowIcon={false}
                  placement="bottom-start"
                  renderTrigger={() => (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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

            return (
              <a
                key={item.label}
                href={item.href}
                className="rounded-md px-2 py-1.5 text-gray-600 no-underline hover:bg-gray-100 hover:text-gray-900"
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 rounded-full bg-gray-100 p-1 md:ml-0">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </button>

          <Dropdown
            inline
            arrowIcon={false}
            placement="bottom-end"
            renderTrigger={() => (
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900"
                aria-label={`Idioma: ${languageLabel}`}
              >
                <Globe className="h-4 w-4" />
              </button>
            )}
          >
            {LANGUAGES.map((l) => (
              <DropdownItem key={l.code} onClick={() => setLanguage(l.code)}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span>{l.label}</span>
                  {language === l.code ? <Check className="h-4 w-4 text-emerald-600" /> : null}
                </div>
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
