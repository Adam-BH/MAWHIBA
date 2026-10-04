/** Seeded demo accounts (scripts/seed.ts). Shown as one-click logins only when NEXT_PUBLIC_DEMO=true. */
export const DEMO_PASSWORD = "Mawhiba2026!";

export const DEMO_ACCOUNTS = [
  { role: "client", email: "client@mawhiba.tn" },
  { role: "coach", email: "coach@mawhiba.tn" },
  { role: "admin", email: "admin@mawhiba.tn" },
] as const;

export const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";
