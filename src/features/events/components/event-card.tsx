import Link from "next/link";
import { Clock, MapPin, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RegisterEventButton } from "@/features/events/components/register-event-button";
import type { NextEvent } from "@/features/events/queries";
import type { Role } from "@/lib/auth";
import { formatDateBlock, formatDateTime, formatTime } from "@/lib/dates";

export function EventCard({ event, viewer }: { event: NextEvent; viewer: Role | null }) {
  const t = useTranslations("events");
  const block = formatDateBlock(event.starts_at);
  const left = event.capacity - event.registered;

  return (
    <article className="flex flex-col gap-5 rounded-4xl border bg-card p-6 sm:flex-row sm:p-8">
      <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-3xl bg-primary text-primary-foreground">
        <span className="font-display text-3xl font-semibold leading-none">{block.day}</span>
        <span className="text-xs uppercase text-accent">{block.month}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <div className="grid gap-1 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 capitalize"><Clock className="size-4" />{formatDateTime(event.starts_at)}-{formatTime(event.ends_at)}</p>
          <p className="flex items-center gap-2"><MapPin className="size-4" />{event.location}</p>
          <p className="flex items-center gap-2"><Users className="size-4" />{left > 0 ? t("spotsLeft", { count: left }) : t("full")}</p>
        </div>
        {event.description && <p className="max-w-2xl whitespace-pre-line">{event.description}</p>}
        <div>
          {viewer === null ? (
            <Button asChild><Link href="/login?next=/">{t("loginToRegister")}</Link></Button>
          ) : viewer === "admin" ? (
            <p className="text-sm text-muted-foreground">{t("registeredCount", { count: event.registered, capacity: event.capacity })}</p>
          ) : (
            <RegisterEventButton eventId={event.id} registered={event.isRegistered} full={left <= 0} />
          )}
        </div>
      </div>
    </article>
  );
}
