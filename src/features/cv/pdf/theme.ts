import path from "node:path";

/**
 * The ONLY place with hard-coded colours: react-pdf and next/og (Satori) can't read CSS variables.
 * Values mirror the tokens in src/app/globals.css — update both together when the design system changes.
 */
export const THEME = {
  colors: {
    primary: "#1d2b5c", // --primary
    primaryForeground: "#f7f8fb", // --primary-foreground
    accent: "#f2802a", // --accent
    accentForeground: "#2b1a0d", // --accent-foreground
    success: "#2f9e5f", // --success
    foreground: "#1a2238", // --foreground
    mutedForeground: "#677089", // --muted-foreground
    muted: "#eef0f4", // --muted
    border: "#dde1e9", // --border
    background: "#ffffff",
  },
  sport: { aqua: "#2f8fc4", combat: "#b8432f", court: "#3a9a5c", field: "#d9861f", mind: "#8a5ac4" }, // --sport-*
  level: {
    local: "#e4e7ee", regional: "#cfe2f3", national: "#bfe6cf", international: "#f6d6a8", olympique: "#f7e19a",
    foreground: "#1f2a44",
  }, // --level-*
  fonts: {
    family: "Lato",
    files: {
      regular: path.join(process.cwd(), "public/fonts/Lato-Regular.ttf"),
      bold: path.join(process.cwd(), "public/fonts/Lato-Bold.ttf"),
      italic: path.join(process.cwd(), "public/fonts/Lato-Italic.ttf"),
    },
  },
} as const;
