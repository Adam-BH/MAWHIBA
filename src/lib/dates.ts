import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { tz, TZDate } from "@date-fns/tz";
import { TIME_ZONE } from "@/lib/config";

const inTz = tz(TIME_ZONE);

export function formatDay(date: string | Date) {
  return format(new Date(date), "EEEE d MMMM", { locale: fr, in: inTz });
}

export function formatTime(date: string | Date) {
  return format(new Date(date), "HH:mm", { in: inTz });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "EEE d MMM · HH:mm", { locale: fr, in: inTz });
}

export function dayKey(date: string | Date) {
  return format(new Date(date), "yyyy-MM-dd", { in: inTz });
}

/** Interpret a local (Tunis) date + "HH:mm" as an absolute instant. */
export function fromLocal(day: string, time: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(new TZDate(y, m - 1, d, hh, mm, TIME_ZONE).getTime());
}

export function formatMonthYear(date: string | Date) {
  return format(new Date(date), "MMMM yyyy", { locale: fr, in: inTz });
}

export function formatLongDate(date: string | Date) {
  return format(new Date(date), "d MMMM yyyy", { locale: fr, in: inTz });
}
