import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";

import { getSiteSettings } from "@/features/site-settings/api";
import { SocialMediaBar } from "@/features/social/components/SocialMediaBar";

export const SiteTopbar = ({
  isTransparent = false,
}: {
  isTransparent?: boolean;
}) => {
  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  return (
    <div
      className={`relative z-20 hidden w-full border-b transition-colors duration-500 lg:block ${isTransparent
        ? "border-transparent bg-transparent text-white/40"
        : "border-slate-100 bg-white/90 text-slate-500 backdrop-blur-md"
        }`}
    >
      <div className="page-container flex h-10 items-center justify-between py-1 text-[11px] font-medium uppercase tracking-wider">
        <div className="flex items-center gap-6">
          {settings?.phone ? (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-3 w-3 opacity-60" />
              <span>{settings.phone}</span>
            </a>
          ) : null}
          {settings?.contact_email ? (
            <a
              href={`mailto:${settings.contact_email.toLowerCase()}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="h-3 w-3 opacity-70" />
              <span>{settings.contact_email.toLowerCase()}</span>
            </a>
          ) : null}
        </div>

        <div className="flex items-center gap-6">
          <SocialMediaBar scrolled={!isTransparent} />
          <div className={`flex items-center gap-3 border-l pl-5 ${isTransparent ? "border-white/10" : "border-slate-100"}`}>
            <div className="flex items-center gap-2.5">
              <button className={`font-bold transition-colors ${isTransparent ? "text-white" : "text-slate-900"}`}>ES</button>
              <button className={`font-bold transition-colors ${isTransparent ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}>CA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
