// tailwind.config.js – Evolved design: 60/30/10 + Smoked Olive dark
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "pale-sage": "#F3F7F4",
        "deep-moss": "#3F6F5E",
        "deep-moss-hover": "#365a4d",
        "soft-clay": "#CFAE70",
        "soft-clay-hover": "#c19d5a",
        // Dark: Smoked Olive (replaces dark sage)
        "dark-sage": "#34332D",
        "dark-sage-surface": "#3d3c36",
        "dark-sage-elevated": "#46453e",
        "dark-moss": "#5a7d6e",
        "dark-clay": "#d4b87a",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-sm": ["2rem", { lineHeight: "1.2" }],
        "display-md": ["2.5rem", { lineHeight: "1.15" }],
        "title": ["1.25rem", { lineHeight: "1.35" }],
        "body": ["0.9375rem", { lineHeight: "1.6" }],
        "caption": ["0.8125rem", { lineHeight: "1.4" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(63, 111, 94, 0.06), 0 4px 12px rgba(63, 111, 94, 0.04)",
        "soft-md": "0 2px 6px rgba(63, 111, 94, 0.06), 0 8px 24px rgba(63, 111, 94, 0.06)",
        "soft-lg": "0 4px 12px rgba(63, 111, 94, 0.08), 0 16px 40px rgba(63, 111, 94, 0.06)",
        "soft-dark": "0 2px 8px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12)",
        "soft-dark-md": "0 4px 12px rgba(0,0,0,0.18), 0 12px 32px rgba(0,0,0,0.14)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
