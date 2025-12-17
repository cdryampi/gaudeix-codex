import type { ReactNode } from "react";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectHint({
  className,
  actionLabel = "mientras haces clic para seleccionar varias opciones",
}: {
  className?: string;
  actionLabel?: string;
}) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Mantén{" "}
      <Keycap ariaLabel="Control (Windows/Linux)">
        <span className="text-[11px] font-semibold">Ctrl</span>
      </Keycap>{" "}
      o{" "}
      <Keycap ariaLabel="Command (Mac)">
        <Command className="h-3 w-3" aria-hidden="true" />
        <span className="text-[11px] font-semibold">Cmd</span>
      </Keycap>{" "}
      {actionLabel}.
    </p>
  );
}

function Keycap({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <kbd
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-primary"
    >
      {children}
    </kbd>
  );
}
