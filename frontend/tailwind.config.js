const tokens = require("../shared/tokens.json");

/**
 * Gaudeix Codex — Design System (Tailwind v3 config)
 *
 * Paleta corporativa oficial:
 *   Primary:        #E7640C   (naranja enérgico)
 *   Primary dark:   #C94B00   (CTAs hover)
 *   Secondary:      #0F76A4   (azul accesible / enlaces)
 *   Secondary light:#7BC2EC   (azul cielo / fondos)
 *   Green:          #036830   (éxito / validaciones)
 *   Green lime:     #93C01F   (detalles)
 *   Accent:         #F9B31F   (highlight / badges)
 *   Background:     #FAFCFE
 *   Surface:        #FFFFFF
 *   Text primary:   #111827
 *   Text secondary: #475569
 *   Border soft:    #E5E7EB
 *
 * Los valores se sincronizan con `frontend/src/index.css` (CSS vars)
 * y se exponen como tokens semánticos de Tailwind.
 */
const palette = {
  primary: {
    50: "#fff5ed",
    100: "#ffe4d0",
    200: "#fed1aa",
    300: "#fdb47a",
    400: "#fa8e44",
    500: "#e7640c",
    600: "#c94b00",
    700: "#a23a00",
    800: "#7d2f06",
    900: "#64270a",
    950: "#371103",
    DEFAULT: "#e7640c",
    dark: "#c94b00",
    light: "#f08a4a",
  },
  secondary: {
    50: "#eaf7fd",
    100: "#d3eefb",
    200: "#a8dff7",
    300: "#7bc2ec",
    400: "#3fa3d8",
    500: "#0f76a4",
    600: "#0d6489",
    700: "#0c5170",
    800: "#0d435c",
    900: "#0e384d",
    950: "#072234",
    DEFAULT: "#0f76a4",
    light: "#7bc2ec",
  },
  green: {
    50: "#e6f5e9",
    100: "#c8e9ce",
    200: "#9bd4a8",
    300: "#6fbf81",
    400: "#4ba760",
    500: "#036830",
    600: "#03572a",
    700: "#054722",
    800: "#07391d",
    900: "#0a2e19",
    950: "#03180c",
    DEFAULT: "#036830",
    light: "#93c01f",
  },
  accent: {
    50: "#fff8e8",
    100: "#fdeec1",
    200: "#fde08a",
    300: "#fcd57a",
    400: "#fac04a",
    500: "#f9b31f",
    600: "#d6900f",
    700: "#a86d0e",
    800: "#825510",
    900: "#694511",
    950: "#3f2607",
    DEFAULT: "#f9b31f",
    light: "#fcd57a",
  },
};

const semanticColors = {
  // Aliases semánticos consumidos por el código
  background: {
    light: "#fafcfe",
    dark: "#0f172a",
    DEFAULT: "#fafcfe",
  },
  surface: {
    light: "#ffffff",
    dark: "#0c1524",
    muted: "#f3f6f9",
    blue: "#eaf7fd",
    DEFAULT: "#ffffff",
  },
  text: {
    primary: "#111827",
    secondary: "#475569",
    muted: "#94a3b8",
    inverse: "#ffffff",
    DEFAULT: "#111827",
  },
  border: {
    soft: "#e5e7eb",
    strong: "#d1d5db",
    blue: "#7bc2ec",
    DEFAULT: "#e5e7eb",
  },
  // Foregrounds para componentes tipo shadcn/ui
  "primary-foreground": "#ffffff",
  "secondary-foreground": "#ffffff",
  "accent-foreground": "#111827",
  destructive: "#C8564A",
  "destructive-foreground": "#ffffff",
  success: "#036830",
  "success-foreground": "#ffffff",
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/dist/**/*.{js,cjs}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ...tokens.colors,
        ...palette,
        ...semanticColors,
      },
      fontFamily: tokens.typography.fonts,
      borderRadius: tokens.borderRadius,
      spacing: tokens.spacing,
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("flowbite/plugin")],
};
