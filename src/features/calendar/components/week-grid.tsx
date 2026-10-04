"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";
import { useTranslations } from "next-intl";
import { EventBlock, type CalEvent } from "@/features/calendar/components/event-block";
import { DAY_END_HOUR, DAY_START_HOUR, layoutDay, minutesOfDay } from "@/lib/calendar";
import { TIME_ZONE } from "@/lib/config";
import { dayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const HOUR_PX = 48;
const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
const top = (minutes: number) => ((Math.min(Math.max(minutes, DAY_START_HOUR * 60), DAY_END_HOUR * 60) - DAY_START_HOUR * 60) / 60) * HOUR_PX;

/** 7 columns, 07:00-22:00, events positioned in Tunis time; overlaps share the column width. */
export function WeekGrid({ days, events, onSelect, onEmptySlot }: {
  days: string[];
  events: CalEvent[];
  onSelect: (e: CalEvent) => void;
  onEmptySlot?: (day: string, time: string) => void;
}) {
  const t = useTranslations("calendar");
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const today = now ? dayKey(now) : null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] border-b">
        <span />
        {days.map((d) => (
          <div key={d} className={cn("px-2 py-2 text-center text-sm", d === today && "bg-accent/30 font-semibold")}>
            <span className="capitalize">{format(new TZDate(`${d}T12:00:00`, TIME_ZONE), "EEE d", { locale: fr })}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[3.5rem_repeat(7,1fr)]" style={{ height: HOURS.length * HOUR_PX }}>
        <div className="relative">
          {HOURS.map((h) => (
            <span key={h} className="absolute end-2 -translate-y-1/2 text-xs text-muted-foreground" style={{ top: (h - DAY_START_HOUR) * HOUR_PX }}>
              {h > DAY_START_HOUR && `${String(h).padStart(2, "0")}:00`}
            </span>
          ))}
        </div>
        {days.map((d) => {
          const dayEvents = events.filter((e) => dayKey(e.start) === d);
          const layout = layoutDay(dayEvents);
          return (
            <div key={d} className={cn("relative border-s", d === today && "bg-accent/10")}
              style={{ backgroundImage: "linear-gradient(to bottom, var(--border) 1px, transparent 1px)", backgroundSize: `100% ${HOUR_PX / 2}px` }}>
              {onEmptySlot && HOURS.flatMap((h) => [0, 30].map((m) => (
                <button key={`${h}:${m}`} type="button" aria-label={t("addSlotAt", { time: `${h}:${String(m).padStart(2, "0")}` })}
                  onClick={() => onEmptySlot(d, `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)}
                  className="absolute inset-x-0 hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                  style={{ top: (h - DAY_START_HOUR + m / 60) * HOUR_PX, height: HOUR_PX / 2 }} />
              )))}
              {dayEvents.map((e) => {
                const { col, cols } = layout.get(e.id) ?? { col: 0, cols: 1 };
                const y = top(minutesOfDay(e.start));
                return (
                  <EventBlock key={e.id} event={e} onClick={() => onSelect(e)} className="absolute z-10"
                    style={{ top: y, height: Math.max(top(minutesOfDay(e.end)) - y, HOUR_PX / 2) - 2, left: `${(col / cols) * 100}%`, width: `calc(${100 / cols}% - 2px)` }} />
                );
              })}
              {now && d === today && (
                <span aria-hidden className="absolute inset-x-0 z-20 h-0.5 bg-primary" style={{ top: top(minutesOfDay(now.toISOString())) }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
