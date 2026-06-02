import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

import logoCabrera from "@/assets/logo/logo-cabrera-white.png";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { getFooterPublic } from "@/features/site-settings/api";
import {
  FooterBadge,
  FooterLegalBlock,
  FooterLink,
  FooterPublicPayload,
  LinkedImage,
} from "@/features/site-settings/types";

type SocialItem = {
  key: string;
  label: string;
  href: string;
  icon: typeof Facebook;
};

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function resolveLinkHref(link: FooterLink): string {
  if (link.type === "category" && link.category?.slug) {
    return `/categorias/${link.category.slug}`;
  }
  if (link.type === "static_page" && link.static_page?.slug) {
    return `/paginas/${link.static_page.slug}`;
  }
  return link.url || "#";
}

function resolveLinkLabel(link: FooterLink): string {
  if (link.type === "category" && link.category?.nombre) {
    return link.category.nombre;
  }
  if (link.type === "static_page" && link.static_page?.titulo) {
    return link.static_page.titulo;
  }
  return link.label || link.url || "Enlace";
}

function resolveImageSrc(image: LinkedImage | null | undefined): string | null {
  if (!image) return null;
  return image.file || image.thumbnail_url || image.variant_thumbnail || null;
}

function buildSocialItems(data: FooterPublicPayload | undefined): SocialItem[] {
  if (!data || !data.show_social_links) return [];

  const items: SocialItem[] = [
    {
      key: "facebook",
      label: "Facebook",
      href: data.social.facebook_url,
      icon: Facebook,
    },
    {
      key: "instagram",
      label: "Instagram",
      href: data.social.instagram_url,
      icon: Instagram,
    },
    {
      key: "twitter",
      label: "Twitter",
      href: data.social.twitter_url,
      icon: Twitter,
    },
    {
      key: "youtube",
      label: "YouTube",
      href: data.social.youtube_url,
      icon: Youtube,
    },
  ];

  return items.filter((item) => Boolean(item.href));
}

function buildLegalItems(legal: FooterLegalBlock | undefined) {
  if (!legal) return [];

  return [
    legal.privacy_page,
    legal.legal_page,
    legal.cookies_page,
    legal.inclusion_page,
  ].filter(
    (page): page is NonNullable<FooterLegalBlock[keyof FooterLegalBlock]> =>
      Boolean(page),
  );
}

function FooterNavLink({
  href,
  children,
  id,
}: {
  href: string;
  children: ReactNode;
  id?: string;
}) {
  const className =
    "text-sm leading-6 text-slate-400 transition-colors hover:text-accent";

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        id={id}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} id={id} className={className}>
      {children}
    </Link>
  );
}
FooterNavLink.displayName = "FooterNavLink";

function FooterBadgeLink({ badge }: { badge: FooterBadge }) {
  const imageSrc = resolveImageSrc(badge.image);
  if (!imageSrc) return null;

  const content = (
    <img
      src={imageSrc}
      alt={badge.alt_text || badge.title}
      className="h-10 w-auto object-contain opacity-90 transition-opacity hover:opacity-100 sm:h-11"
      loading="lazy"
    />
  );

  const badgeLinkId = `footer-badge-link-${badge.id}`;

  if (badge.url) {
    return (
      <a
        href={badge.url}
        id={badgeLinkId}
        target={isExternalUrl(badge.url) ? "_blank" : "_self"}
        rel={isExternalUrl(badge.url) ? "noopener noreferrer" : undefined}
        className="inline-flex items-center rounded-lg px-1 py-1"
        aria-label={badge.title}
      >
        {content}
      </a>
    );
  }

  return <div className="inline-flex items-center px-1 py-1">{content}</div>;
}
FooterBadgeLink.displayName = "FooterBadgeLink";

export function SiteFooter() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ["footer-public"],
    queryFn: getFooterPublic,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const currentYear = new Date().getFullYear();
  const socialItems = buildSocialItems(data);
  const legalItems = buildLegalItems(data?.legal);
  const exploreLinks = (data?.links?.explore || []).filter(Boolean);
  const institutionalLinks = (data?.links?.institutional || []).filter(Boolean);
  const badges =
    data?.show_badges_block && data.badges?.length
      ? data.badges.filter((badge) => Boolean(resolveImageSrc(badge.image)))
      : [];

  const brandLogo =
    resolveImageSrc(data?.branding.logo_dark) ||
    resolveImageSrc(data?.branding.logo) ||
    logoCabrera;
  const brandName = data?.branding.site_name || "Cabrera de Mar";
  const eyebrow = data?.eyebrow || t("Portal oficial");
  const title = data?.title || brandName;
  const description =
    data?.description ||
    data?.branding.tagline ||
    t("Informacion esencial para residentes y visitantes.");
  const contactLines =
    data?.show_contact_block && data?.contact
      ? [
          {
            key: "address",
            label: data.contact.address,
            icon: MapPin,
          },
          {
            key: "phone",
            label: data.contact.phone,
            icon: Phone,
          },
          {
            key: "email",
            label: data.contact.contact_email || data.contact.support_email,
            icon: Mail,
          },
        ].filter((item) => Boolean(item.label))
      : [];

  return (
    <footer
      id="site-footer"
      className="mt-20 border-t border-white/5 bg-text-primary text-white"
    >
      <div className="page-container py-14 md:py-18">
        <div className="grid gap-12 border-b border-white/5 pb-12 md:gap-14 lg:grid-cols-[1.3fr_0.9fr_0.9fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {eyebrow}
              </span>

              <div className="space-y-3">
                <img
                  src={brandLogo}
                  alt={brandName}
                  className={cn(
                    "h-9 w-auto object-contain",
                    brandLogo === logoCabrera ? "brightness-[100]" : "",
                  )}
                />
                <h3 className="max-w-lg text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                  {title}
                </h3>
                <p className="max-w-xl text-sm leading-7 text-slate-400 md:text-[15px]">
                  {description}
                </p>
              </div>
            </div>

            {contactLines.length ? (
              <div className="space-y-3 border-t border-white/5 pt-5">
                {contactLines.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="flex items-start gap-3 text-sm text-slate-400"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {socialItems.length ? (
              <div className="flex flex-wrap gap-2">
                {socialItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      id={`footer-social-link-${item.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>

          <nav className="space-y-5" aria-label="Explorar enlaces">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {t("Explorar")}
            </h4>
            {exploreLinks.length ? (
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.id}>
                    <FooterNavLink
                      href={resolveLinkHref(link)}
                      id={`footer-explore-link-${link.id}`}
                    >
                      {resolveLinkLabel(link)}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>

          <nav className="space-y-5" aria-label="Enlaces institucionales">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              {t("Institucional")}
            </h4>
            {institutionalLinks.length ? (
              <ul className="space-y-3">
                {institutionalLinks.map((link) => (
                  <li key={link.id}>
                    <FooterNavLink
                      href={resolveLinkHref(link)}
                      id={`footer-institutional-link-${link.id}`}
                    >
                      {resolveLinkLabel(link)}
                    </FooterNavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>
        </div>

        {badges.length ? (
          <div className="border-b border-white/5 py-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {badges.map((badge) => (
                <FooterBadgeLink key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs tracking-[0.02em] text-slate-500">
            {data?.copyright_text || `© ${currentYear} ${brandName}`}
          </p>

          {legalItems.length ? (
            <div
              className="flex flex-wrap gap-x-5 gap-y-2"
              role="navigation"
              aria-label="Enlaces legales"
            >
              {legalItems.map((page) => (
                <Link
                  key={page.id}
                  to={`/paginas/${page.slug}`}
                  id={`footer-legal-link-${page.slug}`}
                  className="text-xs text-slate-400 transition-colors hover:text-accent"
                >
                  {page.titulo}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
SiteFooter.displayName = "SiteFooter";
