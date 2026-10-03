import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteSlotButton } from "@/features/slots/components/delete-slot-button";
import { formatDateTime, formatTime } from "@/lib/dates";

type Slot = { id: string; starts_at: string; ends_at: string; location: string; is_booked: boolean };

export function SlotList({ slots }: { slots: Slot[] }) {
  const t = useTranslations("slots");
  if (slots.length === 0) return <EmptyState title={t("empty")} />;
  return (
    <ul className="divide-y rounded-xl border bg-card">
      {slots.map((slot) => (
        <li key={slot.id} className="flex items-center gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium capitalize">{formatDateTime(slot.starts_at)}-{formatTime(slot.ends_at)}</p>
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{slot.location}</p>
          </div>
          {slot.is_booked ? <Badge variant="secondary">{t("booked")}</Badge> : <DeleteSlotButton slotId={slot.id} />}
        </li>
      ))}
    </ul>
  );
}
