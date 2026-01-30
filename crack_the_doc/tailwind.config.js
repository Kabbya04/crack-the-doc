// tailwind.config.js – 60/30/10: Pale Sage, Deep Moss Green, Soft Clay
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // 60% – Pale Sage (dominant)
        "pale-sage": "#F3F7F4",
        // 30% – Deep Moss Green (secondary)
        "deep-moss": "#3F6F5E",
        "deep-moss-hover": "#365a4d",
        // 10% – Soft Clay (accent)
        "soft-clay": "#CFAE70",
        "soft-clay-hover": "#c19d5a",
        // Dark mode equivalents
        "dark-sage": "#152420",
        "dark-sage-surface": "#1e2b28",
        "dark-moss": "#4a7c6b",
        "dark-clay": "#d4b87a",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 8px rgba(63, 111, 94, 0.08)",
        "soft-dark": "0 2px 12px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
