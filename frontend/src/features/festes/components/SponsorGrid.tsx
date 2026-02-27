/**
 * SponsorGrid component for displaying sponsors organized by tier.
 */

import { ExternalLink } from "lucide-react";
import { Sponsor, SponsorTier } from "../types";
import { getTierConfig, TIER_LOGO_SIZES } from "../constants";

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
  // Group sponsors by tier
  const sponsorsByTier = TIER_ORDER.reduce(
    (acc, tier) => {
      const tierSponsors = sponsors
        .filter((s) => s.tier === tier)
        .sort((a, b) => a.order - b.order);
      if (tierSponsors.length > 0) {
        acc[tier] = tierSponsors;
      }
      return acc;
    },
    {} as Record<SponsorTier, Sponsor[]>,
  );

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center items-end gap-x-12 gap-y-8">
      {TIER_ORDER.map((tier) => {
        const tierSponsors = sponsorsByTier[tier];
        if (!tierSponsors || tierSponsors.length === 0) return null;

        const config = getTierConfig(tier);
        const logoSize = TIER_LOGO_SIZES[config.size];

        return (
          <div
            key={tier}
            className="flex flex-wrap justify-center items-center gap-6"
          >
            {/* Sponsors Grid without massive headers */}
            {tierSponsors.map((sponsor) => (
              <SponsorLogo
                key={sponsor.id}
                sponsor={sponsor}
                logoSize={logoSize}
                tierConfig={config}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

interface SponsorLogoProps {
  sponsor: Sponsor;
  logoSize: string;
  tierConfig: ReturnType<typeof getTierConfig>;
}

const SponsorLogo = ({ sponsor, logoSize, tierConfig }: SponsorLogoProps) => {
  const content = (
    <div
      className={`group relative flex items-center justify-center p-4 rounded-2xl border transition-all hover:shadow-lg ${tierConfig.bgColor} ${tierConfig.borderColor}`}
    >
      {sponsor.logo ? (
        <img
          src={sponsor.logo.variant_medium || sponsor.logo.file}
          alt={sponsor.name}
          className={`${logoSize} object-contain transition-transform duration-300 group-hover:scale-105`}
        />
      ) : (
        <div
          className={`${logoSize} flex items-center justify-center text-center ${tierConfig.textColor}`}
        >
          <span className="text-sm font-bold">{sponsor.name}</span>
        </div>
      )}

      {/* External Link Icon on Hover */}
      {sponsor.website && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="h-4 w-4 text-slate-400" />
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
