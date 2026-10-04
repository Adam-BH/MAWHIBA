"use client";

import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatTime } from "@/lib/dates";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export type CalEvent = {
  id: string;
  kind: "booking" | "slot";
  status: Enums<"booking_status"> | "free";
  start: string;
  end: string;
  who: string;
  location: string;
  insured: boolean;
};

const STYLES: Record<CalEvent["status"], string> = {
  confirmed: "bg-primary text-primary-foreground border-primary",
  pending: "border-dashed border-primary bg-card text-foreground",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-card text-muted-foreground line-through border-border",
  declined: "bg-card text-muted-foreground line-through border-border",
  free: "border-dashed border-border bg-transparent text-muted-foreground",
};

/** One session (or free slot), styled by status. `compact` = a one-line pill for the month grid. */
export function EventBlock({ event, compact = false, onClick, className, style }: {
  event: CalEvent;
  compact?: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = useTranslations("calendar");
  const ts = useTranslations("status");
  const label = event.kind === "slot" ? t("free") : event.who;
  const time = `${formatTime(event.start)}-${formatTime(event.end)}`;
  return (
    <button type="button" onClick={onClick} style={style}
      aria-label={t("eventLabel", { time, who: label, status: event.kind === "slot" ? t("free") : ts(event.status as Enums<"booking_status">) })}
      className={cn("flex min-w-0 flex-col overflow-hidden rounded-lg border px-2 py-1 text-left text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        STYLES[event.status], compact && "flex-row items-center gap-1 py-0.5", className)}>
      <span className="flex items-center gap-1 font-semibold">
        {event.status === "pending" && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
        {compact ? formatTime(event.start) : time}
        {event.insured && !compact && <ShieldCheck className="size-3 shrink-0" aria-hidden />}
      </span>
      <span className="truncate">{label}{event.status === "pending" && !compact ? ` · ${t("pending")}` : ""}</span>
      {!compact && <span className="truncate opacity-80">{event.location}</span>}
    </button>
  );
}
