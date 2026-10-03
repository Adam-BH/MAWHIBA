import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { hasContactInfo } from "@/lib/contact-info";
import { canAcceptProposal, effectiveRequestStatus, isOutOfBudget, suggestedProposalPrice } from "@/lib/request-rules";
import { budgetSchema, requestSchema } from "@/lib/validations/requests";

config({ path: ".env.local", quiet: true });

const CONTACT_CASES: [string, boolean][] = [
  ["Appelez-moi au 22 123 456", true],
  ["+216 22123456", true],
  ["22123456", true],
  ["tel: 22.123.456", true],
  ["joignable au 22-123-456", true],
  ["22 12 34 56", true],
  ["+21622123456", true],
  ["écrivez à maman.amine@gmail.com", true],
  ["contact: a.b@site.tn", true],
  ["Mon fils a 8 ans, budget 30-50 pts", false],
  ["Champion de Tunisie 2016-2022", false],
  ["Samedi entre 9h et 11h, 2 séances par semaine", false],
  ["Niveau 3, 25 m sans s'arrêter", false],
  ["Je suis joignable via la plateforme @MAWHIBA", false],
  ["", false],
];

describe("contact-info detector", () => {
  it.each(CONTACT_CASES)("%j → %s", (text, expected) => {
    expect(hasContactInfo(text)).toBe(expected);
  });

  it("handles null/undefined", () => {
    expect(hasContactInfo(null)).toBe(false);
    expect(hasContactInfo(undefined)).toBe(false);
  });
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe.skipIf(!url || !anon)("SQL has_contact_info (source of truth)", () => {
  const db = createClient(url!, anon!);
  it.each(CONTACT_CASES)("%j matches the TS detector", async (text, expected) => {
    const { data, error } = await db.rpc("has_contact_info", { p_text: text });
    expect(error).toBeNull();
    expect(data).toBe(expected);
  });
});

describe("budget validation", () => {
  const schema = budgetSchema("min ≤ max");
  it.each([
    [30, 50, true],
    [40, 40, true],
    [50, 30, false],
    [0, 30, false],
    [-5, 30, false],
    [10.5, 30, false],
  ])("min %d max %d → valid %s", (min, max, valid) => {
    expect(schema.safeParse({ min, max }).success).toBe(valid);
  });

  it("request schema rejects contact info and missing child age", () => {
    const schema = requestSchema({ contact: "contact", budget: "budget", childAge: "age" });
    const base = {
      sport: "Natation", city: "La Marsa", title: "Coach de natation", description: "Pour mon fils, débutant complet.",
      audience: "enfant", childAge: 8, level: "debutant", specialNeeds: false, specialNeedsNote: "", scheduleNote: "Samedi",
      budget: { min: 30, max: 50 },
    } as const;
    expect(schema.safeParse(base).success).toBe(true);
    expect(schema.safeParse({ ...base, description: "Appelez le 22 123 456 svp" }).error?.issues[0].message).toBe("contact");
    expect(schema.safeParse({ ...base, childAge: undefined }).error?.issues[0].message).toBe("age");
    expect(schema.safeParse({ ...base, audience: "adulte", childAge: undefined }).success).toBe(true);
  });
});

describe("hors budget", () => {
  it.each([
    [45, false],
    [30, false],
    [50, false],
    [29, true],
    [60, true],
  ])("price %d in 30–50 → out of budget %s", (price, out) => {
    expect(isOutOfBudget(price, 30, 50)).toBe(out);
  });

  it("suggests the matching offer price, capped at the budget max", () => {
    expect(suggestedProposalPrice(40, 50)).toBe(40);
    expect(suggestedProposalPrice(60, 50)).toBe(50);
    expect(suggestedProposalPrice(null, 50)).toBe(50);
  });
});

describe("proposal acceptance rules", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  const future = new Date("2026-10-10T12:00:00Z");
  const past = new Date("2026-10-01T12:00:00Z");

  it("only a pending proposal on an open, unexpired request can be accepted", () => {
    expect(canAcceptProposal("pending", "open", future, now)).toBe(true);
    expect(canAcceptProposal("pending", "open", past, now)).toBe(false);
    expect(canAcceptProposal("rejected", "open", future, now)).toBe(false);
    expect(canAcceptProposal("withdrawn", "open", future, now)).toBe(false);
    expect(canAcceptProposal("pending", "fulfilled", future, now)).toBe(false);
    expect(canAcceptProposal("pending", "closed", future, now)).toBe(false);
  });

  it("open requests past expires_at read as expired", () => {
    expect(effectiveRequestStatus("open", past, now)).toBe("expired");
    expect(effectiveRequestStatus("open", future, now)).toBe("open");
    expect(effectiveRequestStatus("fulfilled", past, now)).toBe("fulfilled");
  });
});
