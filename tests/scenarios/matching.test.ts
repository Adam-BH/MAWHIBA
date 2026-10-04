import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import { INCLUSIVE_CERT_SLUG } from "@/lib/config";
import type { Database } from "@/lib/supabase/database.types";
import { admin, check, cleanup, enabled, makeCoach, makeUser, postRequest } from "./helpers";

/** Swimming coach based in Bizerte; `inclusive` hands out the badge. */
async function bizerteCoach({ inclusive = false, verified = true } = {}) {
  const coach = await makeCoach({ verified });
  check(await admin.from("profiles").update({ city: "Bizerte" }).eq("id", coach.id));
  check(await admin.from("coach_profiles").update({ specialties: ["Enfants", "Inclusif", "Débutants"], zones: ["Bizerte"] }).eq("user_id", coach.id));
  check(await admin.from("coach_locations").insert({ coach_id: coach.id, lat: 37.2744, lng: 9.8739 }));
  if (inclusive) {
    const { data: cert } = await admin.from("certifications").select("id").eq("slug", INCLUSIVE_CERT_SLUG).single();
    check(await admin.from("coach_certifications").insert({ coach_id: coach.id, certification_id: cert!.id, score: 5, passed: true }));
  }
  return coach;
}

describe.skipIf(!enabled)("scenario: matching", () => {
  afterAll(cleanup);

  it("ranks an inclusive swimming coach nearby first, with its reasons; never unverified or non-inclusive ones", async () => {
    const inclusive = await bizerteCoach({ inclusive: true });
    const plain = await bizerteCoach();
    const unverified = await bizerteCoach({ inclusive: true, verified: false });
    const client = await makeUser("client");
    check(await client.db.from("client_preferences").insert({
      user_id: client.id, sports: ["Natation"], audience: "enfant", child_age: 8, level: "debutant", inclusive_needs: true,
      city: "Bizerte", lat: 37.27, lng: 9.87, budget_max: 50, goals: ["Apprendre"], onboarded_at: new Date().toISOString(),
    }));

    const { data, error } = await client.db.rpc("match_coaches", { p_limit: 20 });
    expect(error).toBeNull();
    expect(data![0].coach_id).toBe(inclusive.id);
    expect(data![0].reasons).toEqual(["sport", "inclusive", "nearby"]);
    expect(data![0].distance_km).toBeLessThan(1);
    const ids = data!.map((m) => m.coach_id);
    expect(ids).not.toContain(plain.id);
    expect(ids).not.toContain(unverified.id);
  });

  it("is for clients only", async () => {
    const coach = await makeCoach();
    expect((await coach.db.rpc("match_coaches", {})).error?.message).toContain("FORBIDDEN");
    const anonDb = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    expect((await anonDb.rpc("match_coaches", {})).error).not.toBeNull();
  });

  it("similar coaches are public and exclude the coach itself", async () => {
    const coach = await bizerteCoach();
    const anonDb = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data, error } = await anonDb.rpc("similar_coaches", { p_coach: coach.id, p_limit: 12 });
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.map((s) => s.coach_id)).not.toContain(coach.id);
  });

  it("scores board requests for a coach without exposing the client", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: requestId } = await postRequest(client.db);
    const { data, error } = await coach.db.rpc("match_requests_for_coach", { p_limit: 100 });
    expect(error).toBeNull();
    const row = data!.find((r) => r.request_id === requestId);
    expect(row?.reasons).toContain("sport");
    expect(Object.keys(row ?? {}).sort()).toEqual(["reasons", "request_id", "score"]);
    expect((await client.db.rpc("match_requests_for_coach", {})).error?.message).toContain("FORBIDDEN");
  });
});
