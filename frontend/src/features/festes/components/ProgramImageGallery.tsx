import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ZoomIn } from "lucide-react";

import { ImageFile } from "../../events/types";

interface ProgramImageGalleryProps {
  images: ImageFile[];
}

// Randomize image dimensions slightly to create a more dynamic masonry look
// if intrinsic dimensions are not available from backend
const getRandomSize = (seed: string) => {
  // Deterministic pseudo-random based on string length to avoid hydration mismatch
  const isPortrait = seed.length % 3 === 0;
  return isPortrait ? { width: 600, height: 800 } : { width: 800, height: 600 };
};

export const ProgramImageGallery = ({ images }: ProgramImageGalleryProps) => {
  const [index, setIndex] = useState(-1);

  if (!images || images.length === 0) {
    return null;
  }

  const photos = images.map((img) => {
    const url = img.variant_large || img.file;
    const dims = getRandomSize(url);
    return {
      src: url,
      width: dims.width,
      height: dims.height,
      title: img.title || "Imatge de la festa",
    };
  });

  return (
    <section className="py-24 relative overflow-hidden bg-slate-950">
      {/* Background premium glow effects */}
      <div className="absolute top-0 left-1/2 -px-20 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      </div>

      <div className="max-w-[90rem] mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <p className="text-sm font-black text-accent uppercase tracking-[0.3em] mb-4 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            Resseny Visual
          </p>
          <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
            Galeria
            <br />
            D'Imatges
          </h2>
          <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto border-t border-white/10 pt-6">
            Reviu els millors moments de la darrera edició. Fes clic sobre
            qualsevol imatge per veure-la a pantalla completa.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-6 md:p-10 shadow-2xl">
          <PhotoAlbum
            photos={photos}
            layout="masonry"
            columns={(containerWidth) => {
              if (containerWidth < 640) return 1;
              if (containerWidth < 1024) return 2;
              return 3;
            }}
            spacing={24}
            onClick={({ index }) => setIndex(index)}
            render={{
              image: (props, context) => (
                <img
                  {...props}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  alt={context.photo.title}
                />
              ),
              wrapper: (props) => (
                <div
                  {...props}
                  className={`group relative rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer border border-white/5 ${props.className || ""}`}
                >
                  {props.children}
                  {/* Glassmorphism gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px]">
                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out flex flex-col items-center">
                      <div className="bg-accent/20 p-4 rounded-full backdrop-blur-md border border-accent/20 mb-3 shadow-[0_0_30px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-shadow">
                        <ZoomIn className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <span className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-md opacity-80">
                        Ampliar
                      </span>
                    </div>
                  </div>

                  {/* Subtle glow edge effect */}
                  <div className="absolute inset-0 border-2 border-accent/0 group-hover:border-accent/40 rounded-2xl transition-colors duration-500 pointer-events-none" />
                </div>
              ),
            }}
          />
        </div>

        <Lightbox
          index={index}
          open={index >= 0}
          close={() => setIndex(-1)}
          slides={photos.map((p) => ({ src: p.src }))}
          styles={{
            container: {
              backgroundColor: "rgba(2, 6, 23, 0.95)",
              backdropFilter: "blur(10px)",
            },
          }}
        />
      </div>
    </section>
  );
};
