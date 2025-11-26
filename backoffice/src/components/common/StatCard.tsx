import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  tone?: "neutral" | "primary" | "success" | "warning" | "info";
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  className,
}: StatCardProps) {
  const toneStyles = {
    neutral: "bg-muted/50 text-muted-foreground",
    primary: "bg-cyan-500/10 text-cyan-500",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-amber-500/10 text-amber-500",
    info: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border/50 bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-border",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
            toneStyles[tone]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1 transition-all group-hover:h-1.5",
          tone === "primary" && "bg-cyan-500",
          tone === "success" && "bg-green-500",
          tone === "warning" && "bg-amber-500",
          tone === "info" && "bg-blue-500",
          tone === "neutral" && "bg-muted"
        )}
      />
    </div>
  );
}
