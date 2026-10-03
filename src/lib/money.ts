import { COMMISSION_RATE, INSURANCE_FEE } from "@/lib/config";

// Mirror of the SQL `split_payout` (source of truth). Display + tests only.
const COACH_PERCENT = 100 - Math.round(COMMISSION_RATE * 100);

export function checkoutTotal(price: number): number {
  return price + INSURANCE_FEE;
}

export function splitPayout(price: number) {
  if (!Number.isInteger(price) || price <= 0) throw new Error("price must be a positive integer");
  const coach = Math.floor((price * COACH_PERCENT) / 100);
  return { coach, platform: price - coach, star: INSURANCE_FEE, total: checkoutTotal(price) };
}
