import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Clock,
  Compass,
  FileText,
  History,
  Hourglass,
  Info,
  Layers,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import { listStories } from "@/features/storytelling/api";
import type { Story } from "@/features/storytelling/types";
import { useTranslation } from "@/hooks/useTranslation";

// Épocas históricas del timeline
interface Stage {
  id: string;
  title: string;
  label: string;
  description: string;
  accentColor: string;
  textColor: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

const STAGES: Stage[] = [
  {
    id: "Laietania",
    title: "Laietania",
    label: "El origen del territorio",
    description:
      "Antes de las villas romanas, el territorio ya tenía caminos, comunidad y paisaje propio. Una primera capa para entender la relación entre montaña, costa y asentamiento.",
    accentColor: "#1B4235", // Verde pino
    textColor: "text-[#1B4235]",
    bgColor: "bg-[#1B4235]/5",
    icon: Compass,
  },
  {
    id: "Ilturo",
    title: "Ilturo",
    label: "La huella romana",
    description:
      "La antigua Ilturo aparece en las infraestructuras, el agua, los caminos y la forma en que el territorio empezó a organizarse.",
    accentColor: "#C85A32", // Terracota
    textColor: "text-[#C85A32]",
    bgColor: "bg-[#C85A32]/5",
    icon: Layers,
  },
  {
    id: "Edad Media",
    title: "Edad Media",
    label: "Castillos, caminos y frontera",
    description:
      "El paisaje medieval se reconoce en las alturas, en Burriac, en los antiguos caminos y en una forma de habitar marcada por defensa, territorio y comunidad.",
    accentColor: "#8C2B3C", // Rojo medieval/Burdeos
    textColor: "text-[#8C2B3C]",
    bgColor: "bg-[#8C2B3C]/5",
    icon: History,
  },
  {
    id: "Modernidad",
    title: "Modernidad",
    label: "Casas, memoria y vida local",
    description:
      "La Cabrera moderna se explica a través de sus casas, fiestas, transformaciones urbanas y pequeñas memorias compartidas.",
    accentColor: "#0F76A4", // Azul mediterráneo
    textColor: "text-[#0F76A4]",
    bgColor: "bg-[#0F76A4]/5",
    icon: Calendar,
  },
];

// 5 Historias de Fallback curadas en el prompt
const FALLBACK_STORIES: Story[] = [
  {
    id: -1,
    slug: "aplec-cabrera-de-mar",
    title: "L'Aplec de Cabrera de Mar",
    summary:
      "Una festividad de hermandad que une a Cabrera a lo largo de las generaciones.",
    content:
      "La festividad tradicional del aplec representa el encuentro social y festivo donde la comunidad comparte música, bailes y memoria oral en un entorno natural.",
    is_published: true,
    historical_period: "Modern",
    reading_time: 4,
    difficulty: "easy",
    source_name: "Archivo municipal",
    category: null,
  },
  {
    id: -2,
    slug: "infraestructures-hidrauliques-romanes",
    title: "Les infraestructures hidràuliques romanes",
    summary: "Los complejos sistemas de gestión de agua en la antigua Ilturo.",
    content:
      "La ingeniería hidráulica romana en Cabrera de Mar destaca por sus depósitos, canalizaciones y termas, demostrando el avanzado dominio técnico del agua en el territorio.",
    is_published: true,
    historical_period: "Roman",
    reading_time: 5,
    difficulty: "medium",
    source_name: "Yacimiento de Can Modolell",
    category: null,
  },
  {
    id: -3,
    slug: "castell-de-burriac",
    title: "El Castell de Burriac",
    summary:
      "La fortaleza medieval vigía que vigila y corona el horizonte del Maresme.",
    content:
      "El Castillo de Burriac es el centinela de piedra que encierra siglos de historia de defensa costera, leyendas de señores feudales y un punto de vigía clave de la comarca.",
    is_published: true,
    historical_period: "Medieval",
    reading_time: 6,
    difficulty: "hard",
    source_name: "Patrimonio de Cabrera",
    category: null,
  },
  {
    id: -4,
    slug: "paisatge-laieta",
    title: "El paisatge laietà",
    summary:
      "Descubre los caminos primigenios de los antiguos pobladores íberos de la costa.",
    content:
      "Antes de la llegada romana, la Cabrera laietana vivía en equilibrio con la montaña, cultivando laderas y controlando los accesos costeros desde poblados elevados como Burriac.",
    is_published: true,
    historical_period: "Iberian",
    reading_time: 5,
    difficulty: "easy",
    source_name: "Poblado íbero de Cabrera",
    category: null,
  },
  {
    id: -5,
    slug: "cabrera-modernista",
    title: "La Cabrera modernista",
    summary:
      "La evolución arquitectónica y estética de la Cabrera de principios de siglo.",
    content:
      "Casas residenciales, detalles ornamentales y el crecimiento urbano de Cabrera a principios del siglo XX, que reflejan la influencia de las corrientes modernistas.",
    is_published: true,
    historical_period: "Modern",
    reading_time: 6,
    difficulty: "medium",
    source_name: "Archivo histórico",
    category: null,
  },
];

const publicMediaUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

export function HistoricalStoryExplorer() {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState<string>("Laietania");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Cierre de modal con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Bloquear scroll de fondo cuando el buscador emergente está abierto
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Consulta a la API para traer historias reales de Cabrera
  const { data: apiStories = [] } = useQuery<Story[]>({
    queryKey: ["stories", "explorer"],
    queryFn: () => listStories(),
    retry: false,
  });

  // Mapeo robusto de historias reales a sus etapas correspondientes del timeline
  const getStageForStory = (story: Story): string => {
    const period = (story.historical_period || "").toLowerCase();
    if (
      period.includes("iberian") ||
      period.includes("laietania") ||
      period.includes("natural") ||
      (story.title + " " + story.summary).toLowerCase().includes("laiet")
    ) {
      return "Laietania";
    }
    if (
      period.includes("roman") ||
      period.includes("ilturo") ||
      (story.title + " " + story.summary).toLowerCase().includes("roman") ||
      (story.title + " " + story.summary).toLowerCase().includes("ilturo")
    ) {
      return "Ilturo";
    }
    if (
      period.includes("medieval") ||
      period.includes("legend") ||
      period.includes("castle") ||
      (story.title + " " + story.summary).toLowerCase().includes("medieval") ||
      (story.title + " " + story.summary).toLowerCase().includes("burriac")
    ) {
      return "Edad Media";
    }
    if (
      period.includes("modern") ||
      (story.title + " " + story.summary).toLowerCase().includes("modern") ||
      (story.title + " " + story.summary).toLowerCase().includes("aplec")
    ) {
      return "Modernidad";
    }
    return "";
  };

  // Clasificar historias reales o usar fallbacks si no hay datos
  const storiesByStage = useMemo(() => {
    const map: Record<string, Story[]> = {
      Laietania: [],
      Ilturo: [],
      "Edad Media": [],
      Modernidad: [],
    };

    // 1. Clasificar historias reales de la API
    apiStories.forEach((story) => {
      const stageId = getStageForStory(story);
      if (stageId && map[stageId]) {
        map[stageId].push(story);
      }
    });

    // 2. Si alguna época de la API está vacía, aplicar su correspondiente fallback del local array
    STAGES.forEach((stage) => {
      if (map[stage.id].length === 0) {
        // Encontrar las historias de fallback locales para esta época
        const stageFallbacks = FALLBACK_STORIES.filter((item) => {
          if (stage.id === "Laietania" && item.historical_period === "Iberian")
            return true;
          if (stage.id === "Ilturo" && item.historical_period === "Roman")
            return true;
          if (
            stage.id === "Edad Media" &&
            item.historical_period === "Medieval"
          )
            return true;
          if (stage.id === "Modernidad" && item.historical_period === "Modern")
            return true;
          return false;
        });
        map[stage.id] = stageFallbacks;
      }
    });

    return map;
  }, [apiStories]);

  // Lista de todas las historias consolidadas (API + Fallbacks) para el buscador global
  const allConsolidatedStories = useMemo(() => {
    const list: Story[] = [...apiStories];

    // Incorporar fallbacks locales que no estén repetidos por slug
    FALLBACK_STORIES.forEach((fallback) => {
      if (!list.some((s) => s.slug === fallback.slug)) {
        list.push(fallback);
      }
    });
    return list;
  }, [apiStories]);

  // Filtrado global de historias del buscador con LÍMITE DE 4-5 RESULTADOS ("muestre pocos resultados")
  const searchedStories = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];

    const filtered = allConsolidatedStories.filter((story) => {
      const title = (story.title || "").toLowerCase();
      const summary = (story.summary || "").toLowerCase();
      const content = (story.content || "").toLowerCase();
      const period = (story.historical_period || "").toLowerCase();
      const source = (story.source_name || "").toLowerCase();

      return (
        title.includes(term) ||
        summary.includes(term) ||
        content.includes(term) ||
        period.includes(term) ||
        source.includes(term)
      );
    });

    // Mostrar pocos resultados (máximo 4) para mantener la vista muy limpia y enfocada
    return filtered.slice(0, 4);
  }, [allConsolidatedStories, searchQuery]);

  const currentStageData =
    STAGES.find((s) => s.id === activeStage) || STAGES[0];
  const activeStories = storiesByStage[activeStage] || [];
  const ActiveStageIcon = currentStageData.icon;

  return (
    <section
      id="historical-story-explorer"
      className="bg-[#FAF8F6] text-[#1C2C3E] py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-b border-[#1C2C3E]/5 relative overflow-hidden transition-colors duration-500 font-sans"
    >
      {/* Fondo texturizado sutil tipo papel crema */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c2c3e_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-[0.015] pointer-events-none" />

      {/* Ilustraciones decorativas flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* 1. Relieve de Mitra - Esquina superior izquierda */}
        <img
          src={publicMediaUrl("media/mitra_deco.png")}
          alt="Relieve de Mitra"
          className="absolute top-16 left-8 md:left-24 w-32 md:w-44 max-w-xs object-contain filter sepia-[10%] rotate-[-6deg] hidden sm:block"
          style={{ opacity: 0.32 }}
        />
        {/* 2. Columna - Lateral derecho superior/medio */}
        <img
          src={publicMediaUrl("media/columna_deco.png")}
          alt="Columna romana rota"
          className="absolute top-[25%] right-6 md:right-16 w-28 md:w-36 max-w-xs object-contain filter sepia-[10%] rotate-[8deg]"
          style={{ opacity: 0.32 }}
        />
        {/* 3. Terrazas agrícolas laietanas - Esquina inferior derecha */}
        <img
          src={publicMediaUrl("media/cultivo_deco.png")}
          alt="Terrazas agrícolas laietanas"
          className="absolute bottom-8 right-8 md:right-24 w-40 md:w-56 max-w-xs object-contain filter sepia-[10%] rotate-[-4deg]"
          style={{ opacity: 0.32 }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        {/* 1. Bloque Editorial de Introducción */}
        <div className="grid gap-8 lg:grid-cols-12 items-end border-b border-[#1C2C3E]/10 pb-12">
          <div className="lg:col-span-8 space-y-5 text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#1C2C3E]/10 bg-[#1C2C3E]/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#1C2C3E]/80">
              <Sparkles className="h-3.5 w-3.5 text-[#C85A32] animate-pulse" />
              {t("Cabrera de Mar contada por capas")}
            </span>
            <h2 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1C2C3E] md:text-5xl lg:text-6xl font-serif">
              {t("Cabrera de Mar, contada por capas")}
            </h2>
            <p className="text-balance text-base leading-relaxed text-[#1C2C3E]/75 md:text-lg max-w-3xl">
              {t(
                "Del mundo laietano a la Cabrera moderna, cada época deja una pista en el paisaje: nombres, caminos, restos, celebraciones y memoria local.",
              )}
            </p>
          </div>

          {/* 2. Disparador de Buscador (Salto a la pantalla / Spotlight) */}
          <div className="lg:col-span-4 w-full">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between rounded-full border border-[#1C2C3E]/15 bg-white/70 p-3.5 text-left text-sm font-semibold text-[#1C2C3E]/40 shadow-sm transition-all hover:border-[#C85A32] hover:bg-white hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C85A32]/20"
            >
              <div className="flex items-center gap-3">
                <Search className="h-4.5 w-4.5 text-[#1C2C3E]/50" />
                <span>{t("Busca una época, lugar o historia...")}</span>
              </div>
              <span className="text-[10px] font-bold bg-[#1C2C3E]/5 border border-[#1C2C3E]/10 px-2 py-0.5 rounded text-[#1C2C3E]/50">
                ⌘K
              </span>
            </button>
          </div>
        </div>

        {/* 3. Timeline selector interactivo por capas */}
        <div className="space-y-12">
          <div className="relative">
            {/* Línea conectora fina detrás */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#1C2C3E]/10 -translate-y-1/2 hidden md:block" />

            <div
              className="grid grid-cols-2 md:flex md:justify-between gap-4 relative z-10"
              role="tablist"
              aria-label="Timeline histórico de Cabrera de Mar"
            >
              {STAGES.map((stage, idx) => {
                const isActive = activeStage === stage.id;
                const StageIcon = stage.icon;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${stage.id}`}
                    id={`tab-${stage.id}`}
                    onClick={() => setActiveStage(stage.id)}
                    className={`flex flex-col items-start p-4 md:p-0 md:bg-transparent rounded-2xl border md:border-none text-left transition-all duration-300 relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C85A32]/40 focus:ring-offset-4 ${
                      isActive
                        ? "bg-white border-[#C85A32]/30 md:border-none shadow-sm md:shadow-none"
                        : "bg-white/20 border-[#1C2C3E]/5 hover:bg-white/50"
                    }`}
                  >
                    {/* Círculo del punto en timeline (solo en desktop) */}
                    <div
                      className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF8F6] border-2 transition-all duration-500 z-20 mb-3"
                      style={{
                        borderColor: isActive
                          ? stage.accentColor
                          : "rgba(28, 44, 62, 0.15)",
                        color: isActive
                          ? stage.accentColor
                          : "rgba(28, 44, 62, 0.4)",
                      }}
                    >
                      <StageIcon className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-serif font-black text-[#1C2C3E]/30 tracking-wider">
                          0{idx + 1}
                        </span>
                        <h3
                          className="text-base font-extrabold tracking-tight font-serif transition-colors"
                          style={{
                            color: isActive ? stage.accentColor : "#1C2C3E",
                          }}
                        >
                          {stage.title}
                        </h3>
                      </div>
                      <p className="text-[11px] font-medium text-[#1C2C3E]/55 line-clamp-1">
                        {stage.label}
                      </p>
                    </div>

                    {/* Indicador de barra activa (solo en desktop) */}
                    {isActive && (
                      <div
                        className="absolute -bottom-3.5 left-0 right-0 h-[3px] rounded-full hidden md:block transition-all duration-300"
                        style={{ backgroundColor: stage.accentColor }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Narrativo Principal */}
          <div
            id={`panel-${currentStageData.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentStageData.id}`}
            className="bg-white rounded-[2.5rem] border border-[#1C2C3E]/10 p-8 md:p-12 relative overflow-hidden transition-all duration-500 shadow-[0_16px_40px_rgba(28,44,62,0.02)] min-h-[420px] grid gap-10 lg:grid-cols-12 items-center"
          >
            {/* Fondo de etapa desvanecido detrás */}
            <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block pointer-events-none">
              <div
                className="w-full h-full flex items-center justify-center p-12 animate-fadeIn"
                style={{ opacity: 0.48 }}
              >
                <img
                  src={
                    currentStageData.id === "Laietania"
                      ? publicMediaUrl("media/laietania_sketch.png")
                      : currentStageData.id === "Ilturo"
                        ? publicMediaUrl("media/ilturo_sketch.png")
                        : currentStageData.id === "Edad Media"
                          ? publicMediaUrl("media/burriac_sketch.png")
                          : publicMediaUrl("media/modernidad_sketch.png")
                  }
                  alt={currentStageData.title}
                  className="max-h-[340px] w-full object-contain"
                />
              </div>
            </div>

            {/* Lado Izquierdo: Narrativa */}
            <div className="lg:col-span-7 space-y-6 text-left relative z-10 animate-fadeIn">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full font-sans ${currentStageData.bgColor} ${currentStageData.textColor}`}
                  >
                    <ActiveStageIcon className="h-3.5 w-3.5" />
                    Época {currentStageData.title}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-serif font-semibold italic text-[#1C2C3E]/45">
                    <Info className="h-3 w-3" />
                    &ldquo;{currentStageData.label}&rdquo;
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold leading-tight text-[#1C2C3E] md:text-4xl font-serif">
                  {currentStageData.label}
                </h3>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-[#1C2C3E]/80 max-w-2xl font-serif">
                {currentStageData.description}
              </p>

              {/* Numeración grande de estilo editorial */}
              <div className="pt-2 flex items-baseline gap-2 text-[#1C2C3E]/10 font-serif font-black select-none pointer-events-none">
                <span className="text-6xl md:text-7xl leading-none">
                  {activeStage === "Laietania"
                    ? "I"
                    : activeStage === "Ilturo"
                      ? "II"
                      : activeStage === "Edad Media"
                        ? "III"
                        : "IV"}
                </span>
                <span className="text-xs font-sans font-bold uppercase tracking-[0.3em]">
                  Capa Histórica
                </span>
              </div>
            </div>

            {/* Lado Derecho: Ilustración Generada y relatos relacionados */}
            <div className="lg:col-span-5 space-y-6 relative z-10 flex flex-col justify-center h-full">
              {/* Tarjeta de Ilustración de época interactiva */}
              <div className="group rounded-[1.5rem] border border-[#1C2C3E]/10 overflow-hidden relative bg-[#FAF8F6] flex items-center justify-center aspect-[16/8] shadow-sm hover:shadow transition-all duration-300">
                <img
                  src={
                    currentStageData.id === "Laietania"
                      ? publicMediaUrl("media/laietania_sketch.png")
                      : currentStageData.id === "Ilturo"
                        ? publicMediaUrl("media/ilturo_sketch.png")
                        : currentStageData.id === "Edad Media"
                          ? publicMediaUrl("media/burriac_sketch.png")
                          : publicMediaUrl("media/modernidad_sketch.png")
                  }
                  alt={currentStageData.title}
                  className="w-full h-full object-cover sepia-[20%] hover:sepia-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                />
                {/* Etiqueta del grabado/ilustración */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-[#1C2C3E] border border-[#1C2C3E]/10 inline-flex items-center gap-1.5">
                  <Sparkles className="h-2.5 w-2.5 text-[#C85A32]" />
                  {t("Grabado Histórico")}
                </div>
              </div>

              {/* Caja de historias relacionadas en esa época */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1C2C3E]/10 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#1C2C3E]/55">
                  <History className="h-3.5 w-3.5 text-[#C85A32]" />
                  <span>Relatos de esta época</span>
                </div>

                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin">
                  {activeStories.length === 0 ? (
                    <p className="text-xs italic text-[#1C2C3E]/50">
                      No hay historias cargadas para esta etapa.
                    </p>
                  ) : (
                    activeStories.map((story) => (
                      <Link
                        key={`${story.id}-${story.slug}`}
                        to={`/historias/${story.slug}`}
                        className="group block p-3.5 bg-[#FAF8F6]/55 hover:bg-[#FAF8F6] rounded-xl border border-[#1C2C3E]/5 transition-all duration-300 hover:border-[#1C2C3E]/15 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1C2C3E] group-hover:text-[#C85A32] transition-colors leading-snug truncate">
                              {story.title}
                            </h4>
                            <p className="text-[10px] text-[#1C2C3E]/55 line-clamp-1 leading-normal font-serif">
                              {story.summary}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#1C2C3E]/45 font-sans">
                              <Clock className="h-3 w-3 text-[#C85A32]" />
                              {story.reading_time || 5}'
                            </span>
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#1C2C3E]/5 text-[#1C2C3E]/45 transition-colors group-hover:bg-[#C85A32] group-hover:text-white group-hover:border-[#C85A32]">
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Enlace para ver todo el archivo */}
              <div className="text-right">
                <Link
                  to="/historias"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] hover:text-[#1B4235] transition-all hover:translate-x-0.5"
                >
                  Explorar archivo completo de relatos
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BUSCADOR INTERACTIVO EMERGENTE ("Salte a la pantalla / Spotlight Modal") */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-10 pt-20 sm:pt-28 backdrop-blur-md bg-[#1C2C3E]/30 transition-all duration-300 animate-fadeIn"
          onClick={() => setIsSearchOpen(false)}
        >
          <div
            className="bg-[#FAF8F6] border border-[#1C2C3E]/10 rounded-[2rem] max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del buscador */}
            <div className="flex items-center justify-between border-b border-[#1C2C3E]/10 pb-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-[#C85A32]" />
                <h3 className="text-lg font-bold font-serif text-[#1C2C3E]">
                  Buscador de Historias
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#1C2C3E]/5 text-[#1C2C3E]/50 transition-colors cursor-pointer"
                aria-label="Cerrar buscador"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Input grande del modal */}
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Escribe una época, leyenda o tema..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-lg sm:text-xl font-serif text-[#1C2C3E] outline-none bg-transparent border-b border-[#1C2C3E]/15 pb-2.5 focus:border-[#C85A32] placeholder:text-[#1C2C3E]/30"
              />
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-[#1C2C3E]/40 hover:text-[#1C2C3E] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Listado de pocos resultados rápidos (máximo 4) */}
            <div className="space-y-4">
              {searchQuery.trim() ? (
                <>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#1C2C3E]/45">
                    <span>
                      Resultados de Búsqueda ({searchedStories.length})
                    </span>
                    <span>Máx 4 sugerencias</span>
                  </div>

                  {searchedStories.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-[#1C2C3E]/10 rounded-xl space-y-2">
                      <FileText className="h-8 w-8 text-[#1C2C3E]/20 mx-auto" />
                      <p className="text-xs font-bold text-[#1C2C3E]/60">
                        No se encontraron relatos
                      </p>
                      <p className="text-[10px] text-[#1C2C3E]/40 max-w-xs mx-auto">
                        Prueba buscando "laietà", "Burriac", "romano" o "aplec".
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchedStories.map((story) => {
                        const stage = STAGES.find(
                          (s) =>
                            s.id ===
                            (story.id < 0
                              ? story.historical_period === "Iberian"
                                ? "Laietania"
                                : story.historical_period === "Roman"
                                  ? "Ilturo"
                                  : story.historical_period === "Medieval"
                                    ? "Edad Media"
                                    : "Modernidad"
                              : getStageForStory(story)),
                        );
                        return (
                          <Link
                            key={`${story.id}-${story.slug}`}
                            to={`/historias/${story.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#FAF8F6] hover:bg-[#C85A32]/5 rounded-xl border border-[#1C2C3E]/10 transition-all duration-300 hover:border-[#C85A32]/25"
                          >
                            <div className="space-y-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                    stage?.textColor || "text-[#1C2C3E]/50"
                                  } ${stage?.bgColor || "bg-[#1C2C3E]/5"}`}
                                >
                                  {stage?.title || story.historical_period}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#1C2C3E]/40 font-sans">
                                  <Clock className="h-2.5 w-2.5" />
                                  {story.reading_time || 5} min
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-[#1C2C3E] group-hover:text-[#C85A32] transition-colors truncate font-serif">
                                {story.title}
                              </h4>
                              <p className="text-[10px] text-[#1C2C3E]/60 line-clamp-1 leading-normal font-serif">
                                {story.summary}
                              </p>
                            </div>
                            <span className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#C85A32] border border-[#C85A32]/10 bg-white px-3 py-1.5 rounded-full shadow-sm hover:bg-[#C85A32] hover:text-white transition-all cursor-pointer">
                              <span>Leer</span>
                              <ArrowRight className="h-3 w-3" />
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Búsquedas y accesos recomendados */
                <div className="space-y-4 pt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#1C2C3E]/45 border-b border-[#1C2C3E]/5 pb-1">
                    Búsquedas sugeridas
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      {
                        query: "Castell de Burriac",
                        label: "El Castillo de Burriac",
                      },
                      { query: "romano", label: "Infraestructuras romanas" },
                      { query: "aplec", label: "El Aplec tradicional" },
                      { query: "laietà", label: "El paisaje Laietano" },
                    ].map((item) => (
                      <button
                        key={item.query}
                        type="button"
                        onClick={() => setSearchQuery(item.query)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#1C2C3E]/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1C2C3E]/70 hover:border-[#C85A32]/35 hover:text-[#C85A32] hover:bg-white shadow-sm transition-all cursor-pointer"
                      >
                        <Tag className="h-3 w-3 text-[#C85A32]" />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#1C2C3E]/45 border-b border-[#1C2C3E]/5 pb-1 pt-3">
                    Explorar por épocas
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STAGES.map((stage) => {
                      const StageIcon = stage.icon;
                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => {
                            setActiveStage(stage.id);
                            setIsSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#1C2C3E]/10 bg-white hover:border-[#C85A32]/25 text-left transition-all cursor-pointer hover:shadow-sm"
                        >
                          <div
                            className={`p-2 rounded-lg ${stage.bgColor} ${stage.textColor}`}
                          >
                            <StageIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1C2C3E] font-serif">
                              {stage.title}
                            </div>
                            <div className="text-[9px] text-[#1C2C3E]/50 line-clamp-1">
                              {stage.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer instructivo del modal */}
            <div className="flex items-center justify-between border-t border-[#1C2C3E]/10 pt-4 text-[10px] text-[#1C2C3E]/40 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Hourglass className="h-3 w-3" />
                Presiona{" "}
                <kbd className="bg-[#1C2C3E]/5 px-1 py-0.5 rounded border border-[#1C2C3E]/10 font-mono">
                  Esc
                </kbd>{" "}
                para salir
              </span>
              <span>Gaudeix Cabrera</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HistoricalStoryExplorer;
