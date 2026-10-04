import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/database.types";
import { admin, cleanup, enabled, makeCoach, makeUser, payAndBook, postRequest } from "./helpers";

describe.skipIf(!enabled)("scenario: roles and privacy", () => {
  afterAll(cleanup);

  it("signing up as admin gives a client account", async () => {
    const email = `scenario-admin-${Date.now()}@test.mawhiba.tn`;
    const { data } = await admin.auth.admin.createUser({ email, password: "Scenario2026!", email_confirm: true, user_metadata: { role: "admin", full_name: "Mallory Test" } });
    const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user!.id).single();
    expect(profile?.role).not.toBe("admin");
    await admin.auth.admin.deleteUser(data.user!.id);
  });

  it("two coaches with the same name can sign up at the same time", async () => {
    const signUp = (i: number) => admin.auth.admin.createUser({
      email: `scenario-twin-${Date.now()}-${i}@test.mawhiba.tn`, password: "Scenario2026!", email_confirm: true,
      user_metadata: { role: "coach", full_name: "Jumeau Identique" },
    });
    const results = await Promise.all([signUp(1), signUp(2), signUp(3)]);
    for (const r of results) if (r.data.user) await admin.auth.admin.deleteUser(r.data.user.id);
    expect(results.map((r) => r.error)).toEqual([null, null, null]);
  });

  it("a coach sees requests only through the board, without client identity", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: requestId } = await postRequest(client.db);

    const direct = await coach.db.from("requests").select("id").eq("id", requestId!);
    expect(direct.data ?? []).toHaveLength(0);

    const { data: row } = await coach.db.from("request_board").select("*").eq("id", requestId!).single();
    expect(row?.client_first_name).toMatch(/^Test\d+$/); // first name only, never the last name
    expect(Object.keys(row ?? {})).not.toContain("client_id");
  });

  it("an unverified coach sees an empty board", async () => {
    const coach = await makeCoach({ verified: false });
    const { data } = await coach.db.from("request_board").select("id");
    expect(data).toEqual([]);
  });

  it("role-gated RPCs refuse the wrong role", async () => {
    const client = await makeUser("client");
    const coach = await makeCoach();
    expect((await client.db.rpc("my_earnings")).error?.message).toContain("FORBIDDEN");
    expect((await coach.db.rpc("start_checkout", { slot_id: coach.slotIds[0] })).error?.message).toContain("FORBIDDEN");
  });

  it("a client can't confirm their own payment: only the gateway webhook (service role) can", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: paymentId } = await client.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    const { error } = await client.db.rpc("confirm_payment", { payment_id: paymentId!, success: true });
    expect(error).not.toBeNull();
    const { data: payment } = await admin.from("payments").select("status").eq("id", paymentId!).single();
    expect(payment?.status).toBe("pending");
  });

  it("a client can't read someone else's bookings or payments", async () => {
    const coach = await makeCoach();
    const alice = await makeUser("client");
    const bob = await makeUser("client");
    await payAndBook(alice.db, coach.slotIds[0], coach.offerId);
    const { data: bookings } = await bob.db.from("bookings").select("id");
    expect(bookings).toEqual([]);
    const { data: payments } = await bob.db.from("payments").select("id");
    expect(payments).toEqual([]);
  });

  it("a coach's exact pin is private; the public sees it rounded to ~1 km", async () => {
    const coach = await makeCoach();
    const other = await makeCoach();
    const { error } = await coach.db.from("coach_locations").insert({ coach_id: coach.id, lat: 36.87824, lng: 10.32471 });
    expect(error).toBeNull();

    const anonDb = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    for (const db of [anonDb, other.db]) {
      const { data } = await db.from("coach_locations").select("lat, lng").eq("coach_id", coach.id);
      expect(data ?? []).toEqual([]);
    }
    expect((await other.db.from("coach_locations").insert({ coach_id: coach.id, lat: 36.8, lng: 10.1 })).error).not.toBeNull();
    const { data: own } = await coach.db.from("coach_locations").select("lat").eq("coach_id", coach.id).single();
    expect(own?.lat).toBe(36.87824);
    const { data: card } = await anonDb.from("coach_profiles").select("map_lat, map_lng").eq("user_id", coach.id).single();
    expect(card).toEqual({ map_lat: 36.88, map_lng: 10.32 });
  });

  it("the answer key of certifications is never readable", async () => {
    const coach = await makeCoach();
    const { error } = await coach.db.from("certifications").select("answer_key");
    expect(error).not.toBeNull();
  });
});
