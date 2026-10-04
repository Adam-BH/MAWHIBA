import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import messages from "../messages/fr.json";
import { CITY_COORDS, MATCH_REASONS } from "@/lib/config";

config({ path: ".env.local", quiet: true });

describe("match reasons", () => {
  it("every reason code has a label", () => {
    expect(Object.keys(messages.matching.reasons).sort()).toEqual([...MATCH_REASONS].sort());
  });
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !anon)("SQL parity", () => {
  const db = createClient(url!, anon!);

  it("match_reason_codes() = MATCH_REASONS", async () => {
    const { data, error } = await db.rpc("match_reason_codes");
    expect(error).toBeNull();
    expect(data).toEqual([...MATCH_REASONS]);
  });

  it.each(Object.entries(CITY_COORDS))("city_point(%s) = CITY_COORDS", async (city, [lat, lng]) => {
    const { data, error } = await db.rpc("city_point", { p_city: city });
    expect(error).toBeNull();
    expect(data).toEqual({ lat, lng });
  });
});
