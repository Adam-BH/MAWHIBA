import { addDays, addMonths, format, startOfMonth, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";
import { TIME_ZONE } from "@/lib/config";
import { dayKey } from "@/lib/dates";
import { z } from "@/lib/validations/zod";

export const CALENDAR_VIEWS = ["week", "month", "agenda"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 22;

const paramsSchema = z.object({
  view: z.enum(CALENDAR_VIEWS).catch("week"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => !Number.isNaN(Date.parse(d))).optional().catch(undefined),
});

/** `?view=week&date=2026-10-05`; anything invalid falls back to this week. */
export function parseCalendarParams(params: { view?: string; date?: string }, now = new Date()) {
  const { view, date } = paramsSchema.parse(params);
  return { view, date: date ?? dayKey(now) };
}

const tzDay = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new TZDate(y, m - 1, d, TIME_ZONE);
};

/** Days shown and the [from, to) instants to query. Weeks start on Monday; the month grid is always 6 weeks. */
export function rangeFor(view: CalendarView, date: string) {
  const day = tzDay(date);
  const start = view === "month" ? startOfWeek(startOfMonth(day), { weekStartsOn: 1 }) : startOfWeek(day, { weekStartsOn: 1 });
  const count = view === "month" ? 42 : 7;
  const days = Array.from({ length: count }, (_, i) => format(addDays(start, i), "yyyy-MM-dd"));
  return { days, from: new Date(start.getTime()), to: new Date(addDays(start, count).getTime()) };
}

/** The date one page before (-1) or after (+1). */
export function shiftDate(view: CalendarView, date: string, dir: -1 | 1) {
  const day = tzDay(date);
  return format(view === "month" ? addMonths(day, dir) : addDays(day, 7 * dir), "yyyy-MM-dd");
}

/** "5 – 11 oct. 2026" or "octobre 2026". */
export function rangeTitle(view: CalendarView, date: string) {
  if (view === "month") return format(tzDay(date), "MMMM yyyy", { locale: fr });
  const { days } = rangeFor(view, date);
  const [first, last] = [tzDay(days[0]), tzDay(days[6])];
  const sameMonth = first.getMonth() === last.getMonth();
  return `${format(first, sameMonth ? "d" : "d MMM", { locale: fr })} – ${format(last, "d MMM yyyy", { locale: fr })}`;
}

/** Minutes since midnight in Tunis time. */
export function minutesOfDay(iso: string) {
  const d = new TZDate(iso, TIME_ZONE);
  return d.getHours() * 60 + d.getMinutes();
}

export type Timed = { id: string; start: string; end: string };

/** Side-by-side columns for overlapping events of one day (greedy: first free column). */
export function layoutDay(events: Timed[]) {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end));
  const result = new Map<string, { col: number; cols: number }>();
  let cluster: string[] = [];
  let columnsEnd: string[] = [];
  let clusterEnd = "";
  const flush = () => {
    for (const id of cluster) result.set(id, { col: result.get(id)!.col, cols: columnsEnd.length });
    cluster = [];
    columnsEnd = [];
  };
  for (const e of sorted) {
    if (cluster.length && e.start >= clusterEnd) flush();
    let col = columnsEnd.findIndex((end) => end <= e.start);
    if (col === -1) col = columnsEnd.push(e.end) - 1;
    else columnsEnd[col] = e.end;
    result.set(e.id, { col, cols: 0 });
    cluster.push(e.id);
    clusterEnd = cluster.length === 1 || e.end > clusterEnd ? e.end : clusterEnd;
  }
  flush();
  return result;
}
