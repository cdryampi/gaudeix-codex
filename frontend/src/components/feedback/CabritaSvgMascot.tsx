import React from "react";

import cabritaSpriteAtlas from "../../assets/cabra/cabrita-sprite-atlas.webp";

export function CabritaSvgMascot() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes cabrita-sprite-loop {
          0%, 8.332% { background-position: 0 0; }
          8.333%, 16.665% { background-position: 9.091% 0; }
          16.666%, 24.999% { background-position: 18.182% 0; }
          25%, 33.332% { background-position: 27.273% 0; }
          33.333%, 41.665% { background-position: 36.364% 0; }
          41.666%, 49.999% { background-position: 45.455% 0; }
          50%, 58.332% { background-position: 54.545% 0; }
          58.333%, 66.665% { background-position: 63.636% 0; }
          66.666%, 74.999% { background-position: 72.727% 0; }
          75%, 83.332% { background-position: 81.818% 0; }
          83.333%, 91.665% { background-position: 90.909% 0; }
          91.666%, 99.999% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        @keyframes cabrita-float {
          0%, 100% { transform: translateY(0); }
          20% { transform: translateY(-2px); }
          44% { transform: translateY(-10px); }
          58% { transform: translateY(2px); }
          80% { transform: translateY(-4px); }
        }

        @keyframes cabrita-glow {
          0%, 100% { opacity: 0.46; transform: scaleX(1); }
          44% { opacity: 0.26; transform: scaleX(0.72); }
          58% { opacity: 0.58; transform: scaleX(1.18); }
        }

        .cabrita-sprite-wrap {
          animation: cabrita-float 9s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        .cabrita-sprite {
          width: clamp(9rem, 32vw, 14rem);
          aspect-ratio: 1 / 1;
          background-image: var(--cabrita-sprite-atlas);
          background-repeat: no-repeat;
          background-size: 1200% 100%;
          background-position: 0 0;
          animation: cabrita-sprite-loop 1.15s step-end infinite;
          filter: drop-shadow(0 18px 28px rgba(15, 76, 129, 0.16));
          will-change: background-position;
        }

        .cabrita-sprite-glow {
          width: min(8rem, 42vw);
          height: 0.7rem;
          margin-top: -1.1rem;
          border-radius: 999px;
          background: radial-gradient(ellipse at center, rgba(15, 76, 129, 0.18), transparent 70%);
          animation: cabrita-glow 9s cubic-bezier(0.45, 0, 0.2, 1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .cabrita-sprite-wrap,
          .cabrita-sprite,
          .cabrita-sprite-glow {
            animation: none;
          }

          .cabrita-sprite {
            background-position: 0 0;
          }
        }
      `,
        }}
      />

      <div
        className="cabrita-sprite-wrap"
        role="img"
        aria-label="Cabrita animada de Cabrera de Mar"
      >
        <div
          className="cabrita-sprite"
          style={
            {
              "--cabrita-sprite-atlas": `url(${cabritaSpriteAtlas})`,
            } as React.CSSProperties
          }
        />
      </div>
      <div className="cabrita-sprite-glow" aria-hidden="true" />
    </div>
  );
}
