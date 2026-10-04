"use client";

import { useTranslations } from "next-intl";
import { EventBlock, type CalEvent } from "@/features/calendar/components/event-block";
import { dayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const MAX_PILLS = 3;

/** 6×7 days; up to 3 pills per day then "+n" (a dot per event on small screens). */
export function MonthGrid({ days, month, events, onSelect, onDay }: {
  days: string[];
  month: string;
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  onDay: (day: string) => void;
}) {
  const t = useTranslations("calendar");
  const today = dayKey(new Date());
  return (
    <div className="grid grid-cols-7 overflow-hidden rounded-2xl border bg-card">
      {days.map((d) => {
        const dayEvents = events.filter((e) => dayKey(e.start) === d).sort((a, b) => a.start.localeCompare(b.start));
        return (
          <div key={d} className={cn("flex min-h-16 min-w-0 flex-col gap-1 border-b border-s p-1 sm:min-h-28", d.slice(0, 7) !== month && "bg-muted/50 text-muted-foreground", d === today && "bg-accent/15")}>
            <button type="button" onClick={() => onDay(d)} className={cn("self-start rounded-full px-1.5 text-xs font-semibold hover:bg-secondary", d === today && "bg-primary text-primary-foreground")}>
              {Number(d.slice(8))}
            </button>
            <div className="hidden flex-col gap-0.5 sm:flex">
              {dayEvents.slice(0, MAX_PILLS).map((e) => <EventBlock key={e.id} event={e} compact onClick={() => onSelect(e)} />)}
              {dayEvents.length > MAX_PILLS && (
                <button type="button" onClick={() => onDay(d)} className="text-start text-xs font-semibold text-primary">{t("more", { count: dayEvents.length - MAX_PILLS })}</button>
              )}
            </div>
            {dayEvents.length > 0 && (
              <button type="button" onClick={() => onDay(d)} aria-label={t("more", { count: dayEvents.length })} className="flex flex-wrap gap-0.5 sm:hidden">
                {dayEvents.map((e) => <span key={e.id} className={cn("size-1.5 rounded-full", e.status === "free" ? "bg-border" : "bg-primary")} />)}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
