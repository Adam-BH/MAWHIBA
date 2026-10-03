import { addMonths, format, nextSaturday, startOfMonth } from "date-fns";
import { fromLocal, formatMonthYear } from "../src/lib/dates";
import { check, db, must } from "./seed-data/db";

/** First Saturday of the month `offset` months from now, 09:00–13:00 Tunis time. */
function firstSaturday(offset: number) {
  const day = nextSaturday(addMonths(startOfMonth(new Date()), offset).getTime() - 86_400_000);
  const starts = fromLocal(format(day, "yyyy-MM-dd"), "09:00");
  return { starts_at: starts.toISOString(), ends_at: new Date(starts.getTime() + 4 * 3_600_000).toISOString() };
}

const event = (offset: number, location: string) => ({
  ...firstSaturday(offset),
  title: `Matinée MAWHIBA · ${formatMonthYear(firstSaturday(offset).starts_at)}`,
  location,
  capacity: 60,
  description: "Ateliers d'initiation encadrés par nos coachs vérifiés (natation, tennis, boxe éducative, athlétisme), "
    + "un atelier premiers secours et un stand Star Assurances. Venez en tenue de sport ; matériel fourni. Gratuit, enfants bienvenus avec un adulte.",
});

/** The next monthly event and the one before it, with a few registrations. The demo client is left unregistered to try it. */
export async function seedEvents(attendees: string[]) {
  const { count } = await db.from("events").select("id", { count: "exact", head: true });
  if (count) return console.log("• events already seeded");
  const next = new Date(firstSaturday(0).starts_at) > new Date() ? 0 : 1;
  const rows = must(await db.from("events").insert([
    event(next - 1, "Complexe sportif El Menzah, Tunis"),
    event(next, "Parc du Belvédère, Tunis"),
  ]).select("id"), "events");
  for (const [i, { id }] of rows.entries()) {
    const who = i === 0 ? attendees : attendees.slice(0, 7);
    check(await db.from("event_registrations").insert(who.map((user_id) => ({ event_id: id, user_id }))), "registrations");
    check(await db.from("events").update({ registered: who.length }).eq("id", id), "event counter");
  }
  console.log("✔ 2 monthly events (previous, next)");
}
