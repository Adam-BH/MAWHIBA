"use client";

import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/shared/empty-state";
import { EventBlock, type CalEvent } from "@/features/calendar/components/event-block";
import { dayKey, formatDay } from "@/lib/dates";

/** Events grouped by day: the mobile view of every range. */
export function AgendaList({ events, onSelect }: { events: CalEvent[]; onSelect: (e: CalEvent) => void }) {
  const t = useTranslations("calendar");
  if (!events.length) return <EmptyState title={t("empty")} />;
  const byDay = Map.groupBy([...events].sort((a, b) => a.start.localeCompare(b.start)), (e) => dayKey(e.start));
  return (
    <ol className="flex flex-col gap-4">
      {[...byDay].map(([day, dayEvents]) => (
        <li key={day}>
          <h3 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">{formatDay(day + "T12:00:00")}</h3>
          <div className="grid gap-2">{dayEvents.map((e) => <EventBlock key={e.id} event={e} onClick={() => onSelect(e)} className="text-sm" />)}</div>
        </li>
      ))}
    </ol>
  );
}
