import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

// Reads `supabase status -o env` and writes .env.local for local (Docker) mode.
const raw = execSync("npx supabase status -o env", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const env = Object.fromEntries(
  raw
    .split("\n")
    .map((line) => line.match(/^([A-Z_0-9]+)="?(.*?)"?$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [m[1], m[2]]),
);

const required = ["API_URL", "ANON_KEY", "SERVICE_ROLE_KEY"];
const missing = required.filter((k) => !env[k]);
if (missing.length) {
  console.error(`supabase status is missing ${missing.join(", ")}. Is local Supabase running (npm run db:start)?`);
  process.exit(1);
}

writeFileSync(
  ".env.local",
  [
    `NEXT_PUBLIC_SUPABASE_URL=${env.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${env.ANON_KEY}`,
    `SUPABASE_SERVICE_ROLE_KEY=${env.SERVICE_ROLE_KEY}`,
    "NEXT_PUBLIC_SITE_URL=http://localhost:3000",
    "",
  ].join("\n"),
);
console.log("✔ .env.local written for local Supabase");
