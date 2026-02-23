// tailwind.config.js – Evolved design: 60/30/10 + Smoked Olive dark
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Light: higher contrast for readability (WCAG AA)
        "pale-sage": "#F2F5F3",
        "deep-moss": "#1a2e26",
        "deep-moss-hover": "#0f1f19",
        "soft-clay": "#B8954E",
        "soft-clay-hover": "#9a7b3d",
        // Dark: readable text on dark bg
        "dark-sage": "#1c1b18",
        "dark-sage-surface": "#252420",
        "dark-sage-elevated": "#2e2d28",
        "dark-moss": "#d4e0da",
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
        soft: "0 1px 3px rgba(26, 46, 38, 0.08), 0 4px 12px rgba(26, 46, 38, 0.05)",
        "soft-md": "0 2px 6px rgba(26, 46, 38, 0.08), 0 8px 24px rgba(26, 46, 38, 0.06)",
        "soft-lg": "0 4px 12px rgba(26, 46, 38, 0.1), 0 16px 40px rgba(26, 46, 38, 0.08)",
        "soft-dark": "0 2px 8px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15)",
        "soft-dark-md": "0 4px 12px rgba(0,0,0,0.22), 0 12px 32px rgba(0,0,0,0.16)",
      },
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")({ nocompatible: true })],
};
