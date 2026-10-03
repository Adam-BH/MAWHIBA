import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { dayKey, formatDay, formatTime } from "@/lib/dates";

type Slot = { id: string; starts_at: string; ends_at: string; location: string };

const FIRST_DAYS = 4;

export function AvailableSlots({ slots, canBook, offerId }: { slots: Slot[]; canBook: boolean; offerId?: string }) {
  const t = useTranslations("coaches");
  if (slots.length === 0) return <EmptyState title={t("noSlots")} />;

  const days = [...Map.groupBy(slots, (s) => dayKey(s.starts_at)).values()];
  const row = (daySlots: Slot[]) => (
    <div key={dayKey(daySlots[0].starts_at)} className="grid gap-2 py-3 sm:grid-cols-[10rem_1fr] sm:items-center">
      <p className="text-sm font-semibold capitalize">{formatDay(daySlots[0].starts_at)}</p>
      <div className="flex flex-wrap gap-2">
        {daySlots.map((slot) => canBook ? (
          <Button key={slot.id} asChild variant="outline" size="sm">
            <Link href={offerId ? `/book/${slot.id}?offer=${offerId}` : `/book/${slot.id}`} title={slot.location}
              aria-label={t("bookAt", { time: formatTime(slot.starts_at) })}>{formatTime(slot.starts_at)}</Link>
          </Button>
        ) : (
          <span key={slot.id} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">{formatTime(slot.starts_at)}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="divide-y border-y">
      {days.slice(0, FIRST_DAYS).map(row)}
      {days.length > FIRST_DAYS && (
        <details className="group">
          <summary className="cursor-pointer py-3 text-sm font-semibold text-primary group-open:hidden">{t("moreSlots", { count: days.length - FIRST_DAYS })}</summary>
          <div className="divide-y">{days.slice(FIRST_DAYS).map(row)}</div>
        </details>
      )}
    </div>
  );
}
