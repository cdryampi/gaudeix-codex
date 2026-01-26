import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "flowbite-react";
import { useTheme } from "@/app/providers/ThemeProvider";
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return _jsxs("div", {
    className:
      "flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1",
    children: [
      _jsx(Button, {
        color: "gray",
        size: "sm",
        className: `p-2 ${theme === "light" ? "bg-white shadow-sm" : ""}`,
        onClick: () => setTheme("light"),
        "aria-label": "Claro",
        children: _jsx(Sun, { className: "h-4 w-4" }),
      }),
      _jsx(Button, {
        color: "gray",
        size: "sm",
        className: `p-2 ${theme === "dark" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`,
        onClick: () => setTheme("dark"),
        "aria-label": "Oscuro",
        children: _jsx(Moon, { className: "h-4 w-4" }),
      }),
      _jsx(Button, {
        color: "gray",
        size: "sm",
        className: `p-2 ${theme === "system" ? "bg-white dark:bg-gray-700 shadow-sm" : ""}`,
        onClick: () => setTheme("system"),
        "aria-label": "Sistema",
        children: _jsx(Monitor, { className: "h-4 w-4" }),
      }),
    ],
  });
}
