/** Public URL of a file in a public bucket. Seeded/external values that are already URLs pass through. */
export function publicStorageUrl(bucket: "covers" | "avatars", path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/** Explicit NEXT_PUBLIC_SITE_URL, else the production domain Vercel provides, else local dev. */
export function siteOrigin(): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return (process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : "http://localhost:3000")).replace(/\/$/, "");
}

export function siteUrl(path = ""): string {
  return `${siteOrigin()}${path}`;
}
