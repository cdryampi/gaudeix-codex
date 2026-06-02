import { useMemo } from "react";

interface StoryFallbackPatternProps {
  period: string;
  className?: string;
}

export function StoryFallbackPattern({
  period,
  className = "",
}: StoryFallbackPatternProps) {
  const normalizedPeriod = useMemo(() => {
    return period.trim().toLowerCase();
  }, [period]);

  return (
    <div
      className={`relative overflow-hidden w-full h-full select-none bg-slate-950 ${className}`}
    >
      {/* Dynamic inline SVG based on era */}
      {normalizedPeriod === "iberian" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Iberian Era: Terracotta, clay, fire, tribal ceramic geometry */}
          <defs>
            <linearGradient id="ib-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C94B00" />
              <stop offset="50%" stopColor="#E7640C" />
              <stop offset="100%" stopColor="#F9B31F" />
            </linearGradient>
            <pattern
              id="ib-tribal"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 0 20 L 20 0 L 40 20 L 20 40 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.5"
              />
              <circle cx="20" cy="20" r="3" fill="rgba(255, 255, 255, 0.12)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ib-grad)" />
          <rect width="100%" height="100%" fill="url(#ib-tribal)" />

          {/* Traditional Iberian ceramic concentric curves */}
          <circle
            cx="200"
            cy="280"
            r="140"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="200"
            cy="280"
            r="110"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="4"
            strokeDasharray="8 6"
            fill="none"
          />
          <circle
            cx="200"
            cy="280"
            r="80"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
            fill="none"
          />

          {/* Stylized Sun/Fire symbol of Iberian worship */}
          <path
            d="M 200 40 L 205 60 L 225 65 L 208 75 L 212 95 L 200 82 L 188 95 L 192 75 L 175 65 L 195 60 Z"
            fill="rgba(255, 255, 255, 0.25)"
          />
          <circle cx="200" cy="68" r="7" fill="#F9B31F" />
        </svg>
      )}

      {normalizedPeriod === "roman" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Roman Era: Imperial purple, royal blue, golden laurels, mosaic tiles */}
          <defs>
            <linearGradient id="rom-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B0764" />
              <stop offset="60%" stopColor="#0F76A4" />
              <stop offset="100%" stopColor="#7BC2EC" />
            </linearGradient>
            <pattern
              id="rom-mosaic"
              x="0"
              y="0"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect
                x="1"
                y="1"
                width="18"
                height="18"
                rx="2"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rom-grad)" />
          <rect width="100%" height="100%" fill="url(#rom-mosaic)" />

          {/* Golden classical laurel wreath silhouette */}
          <g transform="translate(140, 45) scale(1.5)" opacity="0.25">
            <path
              d="M10 50 C10 20, 40 10, 40 10 C40 10, 42 35, 22 46 M70 50 C70 20, 40 10, 40 10 C40 10, 38 35, 58 46"
              stroke="#F9B31F"
              strokeWidth="2.5"
              fill="none"
            />
            <circle cx="28" cy="18" r="2.5" fill="#F9B31F" />
            <circle cx="52" cy="18" r="2.5" fill="#F9B31F" />
            <circle cx="20" cy="30" r="2.5" fill="#F9B31F" />
            <circle cx="60" cy="30" r="2.5" fill="#F9B31F" />
            <circle cx="16" cy="42" r="2.5" fill="#F9B31F" />
            <circle cx="64" cy="42" r="2.5" fill="#F9B31F" />
          </g>

          {/* Classical Temple Columns architectural lines */}
          <path
            d="M 50 210 L 350 210 M 60 210 L 60 110 M 75 210 L 75 110 M 325 210 L 325 110 M 340 210 L 340 110"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 45 100 L 200 60 L 355 100 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
          />
        </svg>
      )}

      {normalizedPeriod === "medieval" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Medieval Era: Dark slate, castle masonry, gothic pointed arches */}
          <defs>
            <linearGradient id="med-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F76A4" />
            </linearGradient>
            <pattern
              id="med-masonry"
              x="0"
              y="0"
              width="60"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="60"
                height="30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
              />
              <line
                x1="30"
                y1="0"
                x2="30"
                y2="30"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#med-grad)" />
          <rect width="100%" height="100%" fill="url(#med-masonry)" />

          {/* Elegant Gothic Intersecting Pointed Arches */}
          <path
            d="M 100 250 C 100 130, 200 90, 200 90 C 200 90, 300 130, 300 250"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M 140 250 C 140 160, 200 130, 200 130 C 200 130, 260 160, 260 250"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 50 250 C 50 150, 140 120, 140 120 C 140 120, 230 150, 230 250 M 170 250 C 170 150, 260 120, 260 120 C 260 120, 350 150, 350 250"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="2"
            fill="none"
          />

          {/* Subtle shield badge overlay */}
          <path
            d="M 200 40 C 215 40, 222 45, 222 55 C 222 75, 200 90, 200 90 C 200 90, 178 75, 178 55 C 178 45, 185 40, 200 40 Z"
            fill="rgba(255, 255, 255, 0.15)"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="40"
            x2="200"
            y2="90"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
          />
        </svg>
      )}

      {normalizedPeriod === "modern" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Modern Era: Catalan Modernisme, organic flower tiles, rolling waves */}
          <defs>
            <linearGradient id="mod-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F76A4" />
              <stop offset="50%" stopColor="#7BC2EC" />
              <stop offset="100%" stopColor="#FAFCFE" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#mod-grad)" />

          {/* Beautiful sinuous organic swirls / wave paths */}
          <path
            d="M -50 120 C 80 50, 120 220, 240 150 C 320 100, 380 200, 450 160 L 450 250 L -50 250 Z"
            fill="rgba(255, 255, 255, 0.12)"
          />
          <path
            d="M -50 150 C 70 90, 110 240, 220 180 C 300 130, 360 220, 450 180 L 450 250 L -50 250 Z"
            fill="rgba(255, 255, 255, 0.08)"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
          />

          {/* Modernisme floral mosaic emblem */}
          <g transform="translate(200, 80) scale(1.2)" opacity="0.25">
            <circle
              cx="0"
              cy="0"
              r="12"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M -15 0 C -5 -15, 5 -15, 15 0 C 5 15, -5 15, -15 0 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
            <path
              d="M 0 -15 C -15 -5, -15 5, 0 15 C 15 5, 15 -5, 0 -15 Z"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
            />
            <circle cx="0" cy="0" r="4" fill="white" />
          </g>
        </svg>
      )}

      {normalizedPeriod === "legend" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Legend Era: Mystical cosmic purple, indigo, shining stars, lunar path */}
          <defs>
            <linearGradient id="leg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#020617" />
              <stop offset="40%" stopColor="#1E1B4B" />
              <stop offset="80%" stopColor="#3B0764" />
              <stop offset="100%" stopColor="#C94B00" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#leg-grad)" />

          {/* Mystical glowing circular portals / trajectories */}
          <circle
            cx="300"
            cy="120"
            r="100"
            stroke="rgba(249, 179, 31, 0.08)"
            strokeWidth="1"
            fill="none"
          />
          <circle
            cx="300"
            cy="120"
            r="70"
            stroke="rgba(249, 179, 31, 0.05)"
            strokeWidth="2"
            strokeDasharray="6 8"
            fill="none"
          />

          {/* Crescent Moon */}
          <path
            d="M 100 60 A 25 25 0 1 0 145 95 A 28 28 0 1 1 100 60 Z"
            fill="#FCD57A"
            opacity="0.6"
          />

          {/* Constellations and shining star vectors */}
          <g opacity="0.5">
            <line
              x1="80"
              y1="120"
              x2="120"
              y2="150"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
            <line
              x1="120"
              y1="150"
              x2="180"
              y2="140"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />
            <line
              x1="180"
              y1="140"
              x2="220"
              y2="180"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="0.8"
            />

            <circle cx="80" cy="120" r="3.5" fill="#fff" />
            <circle cx="120" cy="150" r="2.5" fill="#fff" />
            <circle cx="180" cy="140" r="4" fill="#FCD57A" />
            <circle cx="220" cy="180" r="3" fill="#fff" />

            {/* Sparkles */}
            <path
              d="M 280 60 L 282 65 L 287 67 L 282 69 L 280 74 L 278 69 L 273 67 L 278 65 Z"
              fill="#fff"
            />
            <path
              d="M 240 100 L 241 103 L 244 104 L 241 105 L 240 108 L 239 105 L 236 104 L 239 103 Z"
              fill="#F9B31F"
            />
          </g>
        </svg>
      )}

      {normalizedPeriod === "natural" && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Natural Era: Forest greens, golden highlights, mountain topographic contours */}
          <defs>
            <linearGradient id="nat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#036830" />
              <stop offset="60%" stopColor="#1A360E" />
              <stop offset="100%" stopColor="#93C01F" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#nat-grad)" />

          {/* Topographic line patterns mimicking Cabrera hills */}
          <path
            d="M -20 180 Q 80 140, 180 190 T 380 160"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M -20 200 Q 80 160, 180 210 T 380 180"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M -20 220 Q 80 180, 180 230 T 380 200"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="1"
            fill="none"
          />

          {/* Stylized Pine Trees (TreePine Lucide representation in vector) */}
          <g transform="translate(290, 70)" opacity="0.25">
            <path d="M 20 50 L 20 0" stroke="#93C01F" strokeWidth="3" />
            <path d="M 20 5 L 5 25 L 35 25 Z" fill="#93C01F" />
            <path d="M 20 18 L 0 40 L 40 40 Z" fill="#93C01F" />
          </g>
          <g transform="translate(325, 90) scale(0.7)" opacity="0.2">
            <path d="M 20 50 L 20 0" stroke="#93C01F" strokeWidth="3" />
            <path d="M 20 5 L 5 25 L 35 25 Z" fill="#93C01F" />
            <path d="M 20 18 L 0 40 L 40 40 Z" fill="#93C01F" />
          </g>
        </svg>
      )}

      {/* Fallback for general or unclassified periods */}
      {![
        "iberian",
        "roman",
        "medieval",
        "modern",
        "legend",
        "natural",
      ].includes(normalizedPeriod) && (
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 400 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="def-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F76A4" />
              <stop offset="100%" stopColor="#E7640C" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#def-grad)" />
          <circle
            cx="200"
            cy="125"
            r="80"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 120 125 L 280 125"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
}
