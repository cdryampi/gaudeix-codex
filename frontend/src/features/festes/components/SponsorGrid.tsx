/**
 * SponsorGrid component for displaying sponsors organized by tier.
 */

import { ExternalLink } from "lucide-react";
import { Sponsor, SponsorTier } from "../types";

interface SponsorGridProps {
  sponsors: Sponsor[];
}

// Order of tiers for display
const TIER_ORDER: SponsorTier[] = [
  "platinum",
  "gold",
  "silver",
  "bronze",
  "collaborator",
];

export const SponsorGrid = ({ sponsors }: SponsorGridProps) => {
  if (sponsors.length === 0) {
    return null;
  }

  const sortedSponsors = [...sponsors].sort((a, b) => {
    const tierDelta = TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    return tierDelta || a.order - b.order;
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
      {sortedSponsors.map((sponsor) => (
        <SponsorLogo key={sponsor.id} sponsor={sponsor} />
      ))}
    </div>
  );
};

interface SponsorLogoProps {
  sponsor: Sponsor;
}

const SponsorLogo = ({ sponsor }: SponsorLogoProps) => {
  const content = (
    <div className="group relative flex h-20 w-44 items-center justify-center bg-transparent p-2 transition-opacity hover:opacity-80">
      {sponsor.logo ? (
        <img
          src={sponsor.logo.variant_medium || sponsor.logo.file}
          alt={sponsor.name}
          loading="lazy"
          className="max-h-16 w-full object-contain"
        />
      ) : (
        <div className="flex h-16 w-full items-center justify-center text-center text-text-secondary">
          <span className="text-sm font-semibold">{sponsor.name}</span>
        </div>
      )}

      {sponsor.website && (
        <div className="absolute right-0 top-0 opacity-0 transition-opacity group-hover:opacity-100">
          <ExternalLink className="h-3.5 w-3.5 text-text-muted" />
        </div>
      )}
    </div>
  );

  if (sponsor.website) {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noreferrer"
        title={sponsor.name}
      >
        {content}
      </a>
    );
  }

  return <div title={sponsor.name}>{content}</div>;
};
