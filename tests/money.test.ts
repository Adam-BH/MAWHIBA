import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { checkoutTotal, splitPayout } from "@/lib/money";

config({ path: ".env.local", quiet: true });

// [price, coach, platform, star, total] — shared by the TS and SQL implementations.
const CASES = [
  [45, 38, 7, 2, 47],
  [1, 0, 1, 2, 3],
  [5, 4, 1, 2, 7],
  [7, 5, 2, 2, 9],
  [20, 17, 3, 2, 22],
  [30, 25, 5, 2, 32],
  [33, 28, 5, 2, 35],
  [60, 51, 9, 2, 62],
  [80, 68, 12, 2, 82],
  [99, 84, 15, 2, 101],
  [100, 85, 15, 2, 102],
  [1000, 850, 150, 2, 1002],
] as const;

describe("money.ts", () => {
  it.each(CASES)("price %i → coach %i, platform %i, star %i, total %i", (price, coach, platform, star, total) => {
    expect(splitPayout(price)).toEqual({ coach, platform, star, total });
  });

  it("checkout total is price + insurance fee", () => {
    expect(checkoutTotal(45)).toBe(47);
  });

  it("never loses or creates a point", () => {
    for (let price = 1; price <= 2000; price++) {
      const s = splitPayout(price);
      expect(s.coach + s.platform).toBe(price);
      expect(Number.isInteger(s.coach)).toBe(true);
      expect(s.coach).toBe(Math.floor(price * 0.85 + 1e-9));
    }
  });

  it("rejects non-integer or non-positive prices", () => {
    expect(() => splitPayout(0)).toThrow();
    expect(() => splitPayout(-5)).toThrow();
    expect(() => splitPayout(4.5)).toThrow();
  });
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !anon)("SQL split_payout (source of truth)", () => {
  const db = createClient(url!, anon!);
  it.each(CASES)("price %i matches money.ts", async (price, coach, platform, star, total) => {
    const { data, error } = await db.rpc("split_payout", { p_price: price });
    expect(error).toBeNull();
    expect(data[0]).toEqual({ coach, platform, star, total });
  });
});
