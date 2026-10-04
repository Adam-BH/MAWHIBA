import { describe, expect, it } from "vitest";
import { preferencesSchema, type PreferencesInput } from "@/lib/validations/preferences";

const BASE: PreferencesInput = {
  sports: ["Natation"], audience: "adulte", childAge: null, level: "debutant", inclusiveNeeds: false, languages: ["Français"],
  city: "La Marsa", point: null, budgetMax: 50, availability: ["weekend"], goals: ["Apprendre"],
};
const ok = (patch: Partial<PreferencesInput>) => preferencesSchema.safeParse({ ...BASE, ...patch }).success;

describe("preferences schema", () => {
  it("accepts complete and empty answers", () => {
    expect(ok({})).toBe(true);
    expect(ok({ sports: [], audience: null, level: null, languages: [], city: null, budgetMax: null, availability: [], goals: [] })).toBe(true);
  });

  it("requires a child's age iff the sessions are for a child", () => {
    expect(ok({ audience: "enfant", childAge: 8 })).toBe(true);
    expect(ok({ audience: "enfant", childAge: null })).toBe(false);
    expect(ok({ audience: "adulte", childAge: 8 })).toBe(false);
    expect(ok({ audience: "enfant", childAge: 18 })).toBe(false);
  });

  it("caps sports at 3 and goals at 4", () => {
    expect(ok({ sports: ["Natation", "Tennis", "Yoga"] })).toBe(true);
    expect(ok({ sports: ["Natation", "Tennis", "Yoga", "Judo"] })).toBe(false);
    expect(ok({ goals: ["Apprendre", "Progresser", "Compétition", "Forme & santé", "Perte de poids"] })).toBe(false);
  });

  it("rejects unknown values", () => {
    expect(preferencesSchema.safeParse({ ...BASE, goals: ["Devenir riche"] }).success).toBe(false);
    expect(preferencesSchema.safeParse({ ...BASE, sports: ["Curling"] }).success).toBe(false);
    expect(preferencesSchema.safeParse({ ...BASE, city: "Paris" }).success).toBe(false);
  });

  it("only stores a point rounded to ~1 km, inside Tunisia", () => {
    expect(ok({ point: { lat: 36.88, lng: 10.32 } })).toBe(true);
    expect(ok({ point: { lat: 36.8812, lng: 10.32 } })).toBe(false);
    expect(ok({ point: { lat: 48.85, lng: 2.35 } })).toBe(false);
  });
});
