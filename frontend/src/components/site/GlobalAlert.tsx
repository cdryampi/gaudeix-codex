import {
  AlertCircle,
  X,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

interface GlobalAlertProps {
  message: string;
  type: "info" | "success" | "warning" | "danger";
  link?: string;
}

export const GlobalAlert = ({ message, type, link }: GlobalAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !message) return null;

  const themes = {
    info: {
      bg: "bg-blue-600",
      icon: Info,
    },
    success: {
      bg: "bg-green-600",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-orange-500",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-red-600",
      icon: AlertCircle,
    },
  };

  const theme = themes[type] || themes.info;
  const Icon = theme.icon;

  return (
    <div
      className={`${theme.bg} text-white py-3 px-6 relative z-[2000] shadow-lg animate-in slide-in-from-top duration-500`}
    >
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 shrink-0" />
          <p className="text-sm font-black uppercase tracking-widest leading-tight">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
            >
              Saber más
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
