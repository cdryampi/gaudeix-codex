/**
 * Shared thumbnail renderer for media previews in tables.
 */
import { ImageIcon } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
};

export function MediaThumbnail({ src, alt }: Props) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700"
    />
  );
}
