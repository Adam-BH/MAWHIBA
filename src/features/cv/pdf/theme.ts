import path from "node:path";

/**
 * The ONLY place with hard-coded colours: react-pdf and next/og (Satori) can't read CSS variables.
 * Values mirror the tokens in src/app/globals.css — update both together when the design system changes.
 */
export const THEME = {
  colors: {
    primary: "#4b3fe8", // --primary (--brand-purple)
    primaryForeground: "#f5f5f4", // --primary-foreground (--brand-surface)
    accent: "#c6f432", // --accent (--brand-lime)
    accentForeground: "#120f2e", // --accent-foreground (--brand-ink)
    success: "#2f9e5f", // --success
    foreground: "#120f2e", // --foreground (--brand-ink)
    mutedForeground: "#56546a", // --muted-foreground
    muted: "#ebebed", // --muted
    border: "#e1e1e4", // --border
    background: "#ffffff",
  },
  sport: { aqua: "#2f8fc4", combat: "#b8432f", court: "#3a9a5c", field: "#d9861f", mind: "#8a5ac4" }, // --sport-*
  level: {
    local: "#e4e7ee", regional: "#cfe2f3", national: "#bfe6cf", international: "#f6d6a8", olympique: "#f7e19a",
    foreground: "#1f2a44",
  }, // --level-*
  fonts: {
    family: "Mawhiba",
    files: {
      regular: path.join(process.cwd(), "public/fonts/dm-sans-medium.ttf"), // --font-sans
      bold: path.join(process.cwd(), "public/fonts/montserrat-semibold.ttf"), // --font-display
    },
  },
} as const;
