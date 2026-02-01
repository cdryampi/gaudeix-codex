import { useEffect, useState } from "react";
import {
  Instagram,
  Facebook,
  Ticket,
  Image,
  Link as LinkIcon,
  Twitter,
  Youtube,
} from "lucide-react";
import { listSocialLinks } from "../api";
import type { SocialLink } from "../types";

const iconMap: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  ticket: Ticket,
  flickr: Image,
  twitter: Twitter,
  youtube: Youtube,
};

const getIcon = (iconClass: string) => {
  // Extract key word from "fa-brands fa-instagram" -> "instagram"
  const parts = iconClass.split("-");
  const key = parts[parts.length - 1].toLowerCase();

  const IconComponent = iconMap[key] || LinkIcon;
  return IconComponent;
};

export function SocialMediaBar({ scrolled }: { scrolled: boolean }) {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    listSocialLinks().then((data) => {
      setLinks(data);
    });
  }, []);

  if (links.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mr-4">
      {links.map((link) => {
        const Icon = getIcon(link.icon_class);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full transition-all backdrop-blur-sm group ${
              scrolled
                ? "bg-slate-100/50 hover:bg-primary/10 text-slate-600 hover:text-primary"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
            title={link.name}
          >
            <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
        );
      })}
    </div>
  );
}
