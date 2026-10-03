import Link from "next/link";
import { CalendarX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { dayKey, formatDay, formatTime } from "@/lib/dates";

type Slot = { id: string; starts_at: string; ends_at: string; location: string };

export function AvailableSlots({ slots, canBook }: { slots: Slot[]; canBook: boolean }) {
  const t = useTranslations("coaches");
  if (slots.length === 0) return <EmptyState icon={CalendarX} title={t("noSlots")} />;

  const days = Map.groupBy(slots, (s) => dayKey(s.starts_at));
  return (
    <div className="flex flex-col gap-4">
      {[...days.values()].map((daySlots) => (
        <div key={dayKey(daySlots[0].starts_at)}>
          <p className="mb-2 text-sm font-semibold capitalize">{formatDay(daySlots[0].starts_at)}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              canBook ? (
                <Button key={slot.id} asChild variant="outline" size="lg">
                  <Link href={`/book/${slot.id}`} title={slot.location}>{formatTime(slot.starts_at)} · {t("book")}</Link>
                </Button>
              ) : (
                <span key={slot.id} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">{formatTime(slot.starts_at)}</span>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
