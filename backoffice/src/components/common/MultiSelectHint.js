import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";
export function MultiSelectHint({
  className,
  actionLabel = "mientras haces clic para seleccionar varias opciones",
}) {
  return _jsxs("p", {
    className: cn("text-xs text-muted-foreground", className),
    children: [
      "Mant\u00E9n",
      " ",
      _jsx(Keycap, {
        ariaLabel: "Control (Windows/Linux)",
        children: _jsx("span", {
          className: "text-[11px] font-semibold",
          children: "Ctrl",
        }),
      }),
      " ",
      "o",
      " ",
      _jsxs(Keycap, {
        ariaLabel: "Command (Mac)",
        children: [
          _jsx(Command, { className: "h-3 w-3", "aria-hidden": "true" }),
          _jsx("span", {
            className: "text-[11px] font-semibold",
            children: "Cmd",
          }),
        ],
      }),
      " ",
      actionLabel,
      ".",
    ],
  });
}
function Keycap({ children, ariaLabel }) {
  return _jsx("kbd", {
    "aria-label": ariaLabel,
    className:
      "inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary",
    children: children,
  });
}
