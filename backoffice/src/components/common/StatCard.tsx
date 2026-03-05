import { LucideIcon } from "lucide-react";

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
    neutral:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    primary:
      "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
    success:
      "bg-secondary-50 text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-300",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    info: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${className || ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {label}
          </p>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </h3>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5 transition-transform duration-200 group-hover:scale-105 dark:ring-white/10 ${toneStyles[tone]}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-primary-500/0 via-primary-500/45 to-primary-500/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </div>
  );
}
