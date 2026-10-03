import { afterAll, describe, expect, it } from "vitest";
import { admin, cleanup, enabled, makeCoach, makeUser } from "./helpers";

const events: string[] = [];
const DAY = 86_400_000;

async function makeEvent(capacity: number, inDays = 10) {
  const starts = Date.now() + inDays * DAY;
  const { data } = await admin.from("events").insert({
    title: "Matinée test", location: "Parc test", capacity,
    starts_at: new Date(starts).toISOString(), ends_at: new Date(starts + 3 * 3_600_000).toISOString(),
  }).select("id").single();
  events.push(data!.id);
  return data!.id;
}
const registered = async (id: string) => (await admin.from("events").select("registered").eq("id", id).single()).data?.registered;

describe.skipIf(!enabled)("scenario: monthly event registration", () => {
  afterAll(async () => {
    await admin.from("events").delete().in("id", events);
    await cleanup();
  });

  it("clients and coaches register once, and can unregister", async () => {
    const id = await makeEvent(10);
    const client = await makeUser("client");
    const coach = await makeCoach();
    expect((await client.db.rpc("register_event", { event_id: id })).error).toBeNull();
    expect((await client.db.rpc("register_event", { event_id: id })).error).toBeNull(); // idempotent
    expect((await coach.db.rpc("register_event", { event_id: id })).error).toBeNull();
    expect(await registered(id)).toBe(2);

    expect((await client.db.rpc("unregister_event", { event_id: id })).error).toBeNull();
    expect(await registered(id)).toBe(1);
  });

  it("a full event refuses new registrations", async () => {
    const id = await makeEvent(1);
    const first = await makeUser("client");
    const second = await makeUser("client");
    await first.db.rpc("register_event", { event_id: id });
    expect((await second.db.rpc("register_event", { event_id: id })).error?.message).toContain("EVENT_FULL");
  });

  it("concurrent registrations never exceed capacity", async () => {
    const id = await makeEvent(2);
    const users = await Promise.all([1, 2, 3, 4].map(() => makeUser("client")));
    const results = await Promise.all(users.map((u) => u.db.rpc("register_event", { event_id: id })));
    expect(results.filter((r) => !r.error)).toHaveLength(2);
    expect(await registered(id)).toBe(2);
  });

  it("a started event can't be joined or left", async () => {
    const id = await makeEvent(10, -1);
    const client = await makeUser("client");
    expect((await client.db.rpc("register_event", { event_id: id })).error?.message).toContain("EVENT_PAST");
  });

  it("only admins create events, and users only see their own registrations", async () => {
    const client = await makeUser("client");
    const other = await makeUser("client");
    const boss = await makeUser("admin");
    const args = { title: "Test", description: "", location: "Tunis", capacity: 5,
      starts_at: new Date(Date.now() + 5 * DAY).toISOString(), ends_at: new Date(Date.now() + 5 * DAY + 3_600_000).toISOString() };
    expect((await client.db.rpc("admin_create_event", args)).error?.message).toContain("FORBIDDEN");
    const { data: id } = await boss.db.rpc("admin_create_event", args);
    events.push(id!);

    await client.db.rpc("register_event", { event_id: id! });
    const { data } = await other.db.from("event_registrations").select("user_id").eq("event_id", id!);
    expect(data).toEqual([]);
    expect((await boss.db.rpc("register_event", { event_id: id! })).error?.message).toContain("FORBIDDEN");
  });
});
