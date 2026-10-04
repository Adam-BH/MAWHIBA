import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { CITY_COORDS } from "@/lib/config";
import { distanceKm, formatDistance, isInTunisia, roundCoord } from "@/lib/geo";
import { parseNear } from "@/lib/validations/location";

config({ path: ".env.local", quiet: true });

const at = (city: keyof typeof CITY_COORDS) => ({ lat: CITY_COORDS[city][0], lng: CITY_COORDS[city][1] });
const PAIRS = [["Tunis", "Sfax"], ["Tunis", "La Marsa"], ["Sousse", "Monastir"], ["Bizerte", "Nabeul"], ["Tunis", "Tunis"]] as const;

describe("geo.ts", () => {
  it("measures known distances", () => {
    const tunisSfax = distanceKm(at("Tunis"), at("Sfax"));
    expect(tunisSfax).toBeGreaterThan(225);
    expect(tunisSfax).toBeLessThan(245);
    expect(distanceKm(at("Tunis"), at("La Marsa"))).toBeCloseTo(15, 0);
    expect(distanceKm(at("Tunis"), at("Tunis"))).toBe(0);
  });

  it("is symmetric", () => {
    expect(distanceKm(at("Sousse"), at("Bizerte"))).toBeCloseTo(distanceKm(at("Bizerte"), at("Sousse")), 9);
  });

  it("rounds to the public ~1 km precision", () => {
    expect(roundCoord(36.87824)).toBe(36.88);
    expect(roundCoord(10.32471)).toBe(10.32);
    expect(roundCoord(10.325)).toBe(10.33);
  });

  it("keeps points inside Tunisia", () => {
    expect(Object.keys(CITY_COORDS).every((c) => isInTunisia(at(c as keyof typeof CITY_COORDS)))).toBe(true);
    expect(isInTunisia({ lat: 48.85, lng: 2.35 })).toBe(false);
    expect(isInTunisia({ lat: 36.8, lng: 12.5 })).toBe(false);
  });

  it.each([[0.04, "100 m"], [0.83, "800 m"], [3.24, "3,2 km"], [42.4, "42 km"]])("formats %f km as %s", (km, label) => {
    expect(formatDistance(km)).toBe(label);
  });
});

describe("?near= param", () => {
  it("accepts a ~1 km point inside Tunisia", () => expect(parseNear("36.88,10.32")).toEqual({ lat: 36.88, lng: 10.32 }));
  it.each([undefined, "", "36.8812,10.32", "48.85,2.35", "abc", "36.88"])("ignores %j", (v) => expect(parseNear(v)).toBeUndefined());
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !anon)("SQL distance_km (source of truth)", () => {
  const db = createClient(url!, anon!);
  it.each(PAIRS)("%s → %s matches geo.ts", async (a, b) => {
    const [lat1, lng1] = CITY_COORDS[a];
    const [lat2, lng2] = CITY_COORDS[b];
    const { data, error } = await db.rpc("distance_km", { lat1, lng1, lat2, lng2 });
    expect(error).toBeNull();
    expect(data).toBeCloseTo(distanceKm(at(a), at(b)), 6);
  });
});
