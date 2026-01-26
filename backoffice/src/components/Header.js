import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ThemeToggle } from "./ThemeToggle";
/**
 * Shared Header component for backoffice
 * Used in landing page and auth pages
 */
export function Header() {
  return _jsx("header", {
    className:
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm",
    children: _jsxs("div", {
      className: "container flex h-20 items-center justify-between px-6",
      children: [
        _jsxs("div", {
          className: "flex items-center gap-3",
          children: [
            _jsx("div", {
              className:
                "flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 shadow-lg shadow-primary/20",
              children: _jsx("span", {
                className: "text-xl font-black text-white tracking-tighter",
                children: "GC",
              }),
            }),
            _jsxs("div", {
              className: "flex flex-col",
              children: [
                _jsx("span", {
                  className:
                    "text-xl font-bold tracking-tight text-foreground leading-none",
                  children: "Gaudeix Codex",
                }),
                _jsx("span", {
                  className:
                    "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                  children: "Backoffice",
                }),
              ],
            }),
          ],
        }),
        _jsx(ThemeToggle, {}),
      ],
    }),
  });
}
