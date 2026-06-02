import { Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Festa } from "../types";

interface ProgramTriptychSectionProps {
  festa: Festa;
}

export const ProgramTriptychSection = ({
  festa,
}: ProgramTriptychSectionProps) => {
  // Use posters or gallery photos to create a triptych effect
  const images: string[] = [];

  if (festa.posters && festa.posters.length > 0) {
    images.push(...festa.posters.map((p) => p.variant_large || p.file));
  }
  if (festa.gallery && festa.gallery.length > 0 && images.length < 3) {
    images.push(
      ...festa.gallery
        .slice(0, 3 - images.length)
        .map((g) => g.variant_large || g.file),
    );
  }

  // Fill with fallbacks if needed
  while (images.length < 3) {
    images.push(
      festa.featured_media?.variant_large ||
        festa.featured_media?.file ||
        festa.image_url ||
        "/placeholder-festa.jpg",
    );
  }

  const hasPdf = !!festa.program_pdf?.file;

  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="max-w-[90rem] mx-auto px-6 lg:px-8 flex flex-col items-center justify-center relative z-10">
        {/* Editorial Header */}
        <div className="max-w-3xl text-center mb-16 mx-auto flex flex-col items-center">
          <p className="text-xs font-bold tracking-[0.2em] text-green uppercase mb-4">
            EL PROGRAMA
          </p>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tight text-center uppercase">
            El
            <br />
            Programa
            <br />
            Oficial de
            <br />
            Mà
          </h2>
        </div>

        {/* Triptych Visual side - Centered */}
        <div className="relative h-[400px] md:h-[500px] w-full max-w-4xl flex items-center justify-center perspective-1000 mb-16 mx-auto">
          {/* Left page */}
          <div
            className="absolute z-10 w-[200px] md:w-[260px] h-[300px] md:h-[420px] rounded-l-md overflow-hidden shadow-[10px_0_20px_-10px_rgba(0,0,0,0.5)] transform-gpu rotate-y-12 -translate-x-[45%] translate-z-[-20px] transition-transform duration-700 hover:rotate-y-0 hover:-translate-x-[40%] hover:z-30 bg-white group cursor-pointer"
            style={{ transformOrigin: "right center" }}
          >
            <img
              src={images[1]}
              alt="Folleto página izquierda"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Center page (Cover) */}
          <div className="absolute z-20 w-[220px] md:w-[280px] h-[320px] md:h-[450px] overflow-hidden shadow-2xl transform-gpu transition-transform duration-700 hover:scale-105 hover:z-30 bg-white group cursor-pointer border border-slate-100">
            <img
              src={images[0]}
              alt="Folleto portada"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Right page */}
          <div
            className="absolute z-10 w-[200px] md:w-[260px] h-[300px] md:h-[420px] rounded-r-md overflow-hidden shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.5)] transform-gpu -rotate-y-12 translate-x-[45%] translate-z-[-20px] transition-transform duration-700 hover:rotate-y-0 hover:translate-x-[40%] hover:z-30 bg-white group cursor-pointer"
            style={{ transformOrigin: "left center" }}
          >
            <img
              src={images[2]}
              alt="Folleto página derecha"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Floating Call to actions - Centered exactly per mockup */}
        <div className="relative z-30 flex flex-col sm:flex-row items-center justify-center gap-6 mx-auto w-full max-w-2xl px-4">
          <Link
            to="/festes/programacio"
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm shadow-[0_8px_30px_rgb(74,139,60,0.3)] hover:bg-green-700 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
          >
            <FileText className="h-5 w-5" />
            OBRIR FULLETÓ VIRTUAL
          </Link>

          {hasPdf && (
            <a
              href={festa.program_pdf!.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 bg-transparent border-2 border-green text-green px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-green-600/5 hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              <Download className="h-5 w-5" />
              DESCARREGAR VERSIÓ IMPRIMIBLE
            </a>
          )}
        </div>
      </div>

      {/* Required style for 3D effect */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-12 { transform: rotateY(12deg) translateX(-45%) translateZ(-50px); }
        .-rotate-y-12 { transform: rotateY(-12deg) translateX(45%) translateZ(-50px); }
        @media (max-width: 768px) {
          .rotate-y-12 { transform: rotateY(12deg) translateX(-40%) translateZ(-50px); }
          .-rotate-y-12 { transform: rotateY(-12deg) translateX(40%) translateZ(-50px); }
        }
      `}</style>
    </section>
  );
};
