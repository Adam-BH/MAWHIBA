/** Public URL of a file in a public bucket. Seeded/external values that are already URLs pass through. */
export function publicStorageUrl(bucket: "covers" | "avatars", path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function siteUrl(path = ""): string {
  return `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}${path}`;
}
