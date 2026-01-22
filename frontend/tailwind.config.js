const tokens = require('../shared/tokens.json');

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
        // Legacy colors to maintain compatibility during migration
        "puerto-rico": {
          50: "#f1fcf9",
          100: "#d1f6ed",
          200: "#a4ebdc",
          300: "#6edac6",
          400: "#3ebfab",
          500: "#27a593",
          600: "#1c8578",
          700: "#1b6a62",
          800: "#1a554f",
          900: "#1a4743",
          950: "#092a28",
        },
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
