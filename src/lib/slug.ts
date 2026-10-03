// Mirror of SQL `slugify` / `unique_coach_slug` (used at signup and for backfills).
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "coach";
}

/** `base`, then `base-2`, `base-3`… until it isn't in `taken`. */
export function uniqueSlug(text: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(text);
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
