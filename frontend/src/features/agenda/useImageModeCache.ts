import { useCallback, useMemo, useState } from "react";

export type ImageMode = "photo" | "poster";

const cache = new Map<string, ImageMode>();

export function useImageModeCache(imageUrl: string) {
  const initial = useMemo(() => cache.get(imageUrl) ?? null, [imageUrl]);
  const [mode, setMode] = useState<ImageMode | null>(initial);

  const onImageLoad = useCallback(
    (img: HTMLImageElement) => {
      if (cache.has(imageUrl)) {
        setMode(cache.get(imageUrl)!);
        return;
      }

      const ratio = img.naturalHeight / Math.max(1, img.naturalWidth);
      const next: ImageMode = ratio > 1.2 ? "poster" : "photo";
      cache.set(imageUrl, next);
      setMode(next);
    },
    [imageUrl]
  );

  return { mode, onImageLoad };
}

