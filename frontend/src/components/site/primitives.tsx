import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type HeroMetric = {
  label: string;
  value: ReactNode;
};

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  aside,
  media,
  metrics,
  tone = "light",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  aside?: ReactNode;
  media?: ReactNode;
  metrics?: HeroMetric[];
  tone?: "light" | "muted" | "immersive";
  className?: string;
}) {
  const isImmersive = tone === "immersive";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border-soft",
        isImmersive
          ? "bg-slate-950 text-white"
          : tone === "muted"
            ? "sand-section"
            : "coast-section",
        className,
      )}
    >
      {isImmersive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-slate-900 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,178,77,0.15),transparent_40%)] pointer-events-none" />
        </>
      )}

      <div className="page-container relative py-10 md:py-14">
        {breadcrumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              "mb-7 flex flex-wrap items-center gap-2 text-sm",
              isImmersive ? "text-white/70" : "text-text-secondary",
            )}
          >
            {breadcrumbs.map((item, index) => (
              <span
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                {item.href ? (
                  <Link
                    to={item.href}
                    id={`hero-breadcrumb-link-${index}`}
                    className={cn(
                      "transition-colors",
                      isImmersive ? "hover:text-white" : "hover:text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isImmersive ? "text-white" : "text-text-primary"}
                  >
                    {item.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 ? (
                  <span
                    className={
                      isImmersive ? "text-white/30" : "text-text-secondary/40"
                    }
                  >
                    /
                  </span>
                ) : null}
              </span>
            ))}
          </nav>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-6">
            {eyebrow ? (
              <span
                className={cn(
                  "eyebrow",
                  isImmersive
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-secondary/15 bg-surface/70 text-secondary",
                )}
              >
                {eyebrow}
              </span>
            ) : null}

            <div className="max-w-4xl space-y-4">
              <h1
                className={cn(
                  "text-4xl md:text-6xl text-balance",
                  isImmersive ? "text-white" : "text-text-primary",
                )}
              >
                {title}
              </h1>
              {description ? (
                <div
                  className={cn(
                    "max-w-3xl text-base md:text-xl",
                    isImmersive
                      ? "text-white/90 [&_p]:text-white/90"
                      : "[&_p]:text-text-secondary",
                  )}
                >
                  {description}
                </div>
              ) : null}
            </div>

            {metrics?.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col border-l-2 border-border-soft pl-4 py-1"
                  >
                    <p
                      className={cn(
                        "text-[11px] font-semibold uppercase tracking-[0.18em]",
                        isImmersive ? "text-white/75" : "text-text-secondary",
                      )}
                    >
                      {item.label}
                    </p>
                    <div
                      className={cn(
                        "mt-1 text-lg font-semibold",
                        isImmersive ? "text-white" : "text-text-primary",
                      )}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {actions ? (
              <div className="flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>

          <div className="space-y-4">
            {media ? (
              <div className="card-surface overflow-hidden border-white/20 bg-white/12 text-white shadow-[0_28px_80px_rgba(10,38,61,0.2)]">
                {media}
              </div>
            ) : null}
            {aside ? (
              <div
                className={cn(
                  "card-surface p-6",
                  isImmersive ? "border-white/20 bg-white/12 text-white" : "",
                )}
              >
                {aside}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
PageHero.displayName = "PageHero";

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-3">
        {eyebrow ? <span className="section-kicker">{eyebrow}</span> : null}
        <h2 className="text-3xl text-text-primary md:text-5xl text-balance">
          {title}
        </h2>
        {description ? (
          <div className="max-w-2xl text-base md:text-lg text-text-secondary">
            {description}
          </div>
        ) : null}
        <div className="section-divider max-w-[160px]" />
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
SectionHeader.displayName = "SectionHeader";

export function InfoBand({
  items,
  className,
}: {
  items: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
    href?: string;
    external?: boolean;
  }>;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[2.5rem] bg-surface/95 p-2 shadow-[0_24px_60px_rgba(10,35,60,0.06)] ring-1 ring-border-soft backdrop-blur-xl md:rounded-[3rem] md:p-3",
        className,
      )}
    >
      <ul
        className={cn(
          "grid grid-cols-1 gap-1 sm:grid-cols-2",
          items.length >= 4 ? "lg:grid-cols-4" : "",
        )}
      >
        {items.map((item) => {
          const content = (
            <div className="group relative flex flex-col items-center justify-center gap-4 rounded-[2rem] px-5 py-6 transition-all duration-300 hover:bg-surface-muted/80 sm:flex-row sm:justify-start">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-primary transition-all duration-500 ease-out group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(15,76,129,0.2)]">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-base font-bold leading-tight text-text-primary transition-colors group-hover:text-primary">
                  {item.title}
                </p>
                <p className="text-sm font-medium leading-snug text-text-secondary transition-colors group-hover:text-text-secondary line-clamp-2 md:line-clamp-none">
                  {item.description}
                </p>
              </div>
            </div>
          );

          if (!item.href) {
            return <li key={item.title}>{content}</li>;
          }

          const uniqueLinkId = `infoband-link-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          if (item.external) {
            return (
              <li key={item.title}>
                <a
                  href={item.href}
                  id={uniqueLinkId}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[2rem]"
                >
                  {content}
                </a>
              </li>
            );
          }

          return (
            <li key={item.title}>
              <Link
                to={item.href}
                id={uniqueLinkId}
                className="block rounded-[2rem]"
              >
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
InfoBand.displayName = "InfoBand";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      role="search"
      aria-label="Filtros"
      className={cn(
        "rounded-3xl border border-border-soft bg-surface/80 p-4 md:p-5 backdrop-blur-md shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
FilterBar.displayName = "FilterBar";

export function ContentCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("card-surface", className)}>{children}</div>;
}
ContentCard.displayName = "ContentCard";

export function DataCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col h-full gap-3 p-5 rounded-3xl border border-border-soft bg-surface-muted/50 transition-colors hover:bg-surface-muted",
        className,
      )}
    >
      {Icon ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-text-primary shadow-sm border border-border-soft">
          <Icon className="h-4 w-4" />
        </div>
      ) : null}
      <div className="space-y-1 mt-auto shrink-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
          {label}
        </p>
        <div className="text-xl font-bold text-text-primary">{value}</div>
      </div>
    </div>
  );
}
DataCard.displayName = "DataCard";

export function MunicipalCTA({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2.5rem] bg-slate-950 text-white shadow-[0_32px_80px_rgba(2,6,23,0.15)] ring-1 ring-white/10 cta-glowing-ring transition-all duration-700 ease-out hover:-translate-y-1.5 hover:shadow-[0_48px_96px_rgba(2,6,23,0.22)] md:rounded-[3rem]",
        className,
      )}
    >
      {/* Mesh gradients container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Deep navy base overlay */}
        <div className="absolute inset-0 bg-slate-950 opacity-80" />

        {/* Animated Bubble 1: Primary HSL soft blue */}
        <div className="absolute -top-1/4 -left-1/4 w-full h-full rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_65%)] blur-[80px] animate-mesh-1" />

        {/* Animated Bubble 2: Warm accent amber/gold */}
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full rounded-full bg-[radial-gradient(circle_at_center,rgba(255,191,59,0.18),transparent_65%)] blur-[80px] animate-mesh-2" />

        {/* Ambient vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(11,15,25,0.75)_100%)]" />
      </div>

      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60" />

      <div className="page-container relative z-10 flex flex-col items-center py-20 text-center md:py-28">
        <div className="max-w-4xl space-y-6">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4.5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 shadow-[0_8px_32px_rgba(255,255,255,0.03)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)] animate-pulse" />
              {eyebrow}
            </span>
          ) : null}
          <h2 className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-[3.5rem] leading-[1.1] drop-shadow-sm">
            {title}
          </h2>
          <div className="mx-auto max-w-2xl text-balance text-base font-medium leading-relaxed text-slate-300 md:text-lg">
            {description}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap justify-center items-center gap-5">
          {actions}
        </div>
      </div>
    </section>
  );
}
MunicipalCTA.displayName = "MunicipalCTA";
