/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Municipal palette (institutional, trustworthy, sober)
        primary: {
          50: "#f0f6fb",
          100: "#d9e9f5",
          200: "#b5d3e9",
          300: "#89b7d9",
          400: "#5e9bc8",
          500: "#3f82b5",
          600: "#326b97",
          700: "#2a5578",
          800: "#254865",
          900: "#213d55",
          950: "#152739",
        },
        // Secondary accent (soft civic green)
        secondary: {
          50: "#f1f7f4",
          100: "#dcece3",
          200: "#badac7",
          300: "#8fc1a5",
          400: "#66a985",
          500: "#4c936f",
          600: "#3b7659",
          700: "#315e49",
          800: "#2b4c3c",
          900: "#243f32",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [require("flowbite/plugin"), require("@tailwindcss/typography")],
};
