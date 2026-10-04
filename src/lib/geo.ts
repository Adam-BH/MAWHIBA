// Mirror of the SQL `distance_km` (source of truth for matching). Display + tests only.
const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

export type LatLng = { lat: number; lng: number };

export function distanceKm(a: LatLng, b: LatLng): number {
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Public precision: 2 decimals ≈ 1 km. Same as SQL `round(x::numeric, 2)`. */
export function roundCoord(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Tunisia bounding box, same as the `coach_locations` check constraints. */
export function isInTunisia({ lat, lng }: LatLng): boolean {
  return lat >= 30 && lat <= 38 && lng >= 7 && lng <= 12;
}

/** "800 m", "3,2 km", "42 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.max(100, Math.round(km * 10) * 100)} m`;
  return km < 10 ? `${km.toFixed(1).replace(".", ",")} km` : `${Math.round(km)} km`;
}
