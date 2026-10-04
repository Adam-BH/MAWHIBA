"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BookingCard } from "@/features/bookings/components/booking-card";
import type { BookingRow } from "@/features/bookings/queries";
import { AgendaList } from "@/features/calendar/components/agenda-list";
import type { CalEvent } from "@/features/calendar/components/event-block";
import { MonthGrid } from "@/features/calendar/components/month-grid";
import { WeekGrid } from "@/features/calendar/components/week-grid";
import { DeleteSlotButton } from "@/features/slots/components/delete-slot-button";
import { SlotForm } from "@/features/slots/components/slot-form";
import type { CalendarView } from "@/lib/calendar";
import { formatDateTime, formatTime } from "@/lib/dates";

type Slot = { id: string; starts_at: string; ends_at: string; location: string };

/** Calendar body + the side sheet (booking details with the existing actions, or a new slot for coaches). */
export function CalendarBoard({ view, date, days, bookings, slots, viewer, slotDefaults }: {
  view: CalendarView;
  date: string;
  days: string[];
  bookings: BookingRow[];
  slots: Slot[];
  viewer: "client" | "coach";
  slotDefaults: { duration: number; location: string };
}) {
  const t = useTranslations("calendar");
  const router = useRouter();
  const [showCancelled, setShowCancelled] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; time: string } | null>(null);

  const events: CalEvent[] = [
    ...bookings
      .filter((b) => showCancelled || (b.status !== "cancelled" && b.status !== "declined"))
      .map((b): CalEvent => ({
        id: b.id, kind: "booking", status: b.status, start: b.slot.starts_at, end: b.slot.ends_at, location: b.slot.location,
        who: (viewer === "coach" ? b.client : b.coach).full_name.split(" ")[0], insured: b.insurance_fee > 0,
      })),
    ...slots.map((s): CalEvent => ({ id: s.id, kind: "slot", status: "free", start: s.starts_at, end: s.ends_at, location: s.location, who: "", insured: false })),
  ];
  const booking = bookings.find((b) => b.id === selected);
  const slot = slots.find((s) => s.id === selected);
  const select = (e: CalEvent) => setSelected(e.id);
  const openDay = (d: string) => router.push(`/sessions?view=week&date=${d}`, { scroll: false });
  const agenda = <AgendaList events={events} onSelect={select} />;

  return (
    <>
      <Label className="mb-3 flex w-fit items-center gap-2 text-sm font-normal">
        <Checkbox checked={showCancelled} onCheckedChange={(c) => setShowCancelled(c === true)} />{t("showCancelled")}
      </Label>
      {view === "month" ? (
        <MonthGrid days={days} month={date.slice(0, 7)} events={events} onSelect={select} onDay={openDay} />
      ) : view === "week" ? (
        <>
          <div className="hidden md:block">
            <WeekGrid days={days} events={events} onSelect={select}
              onEmptySlot={viewer === "coach" ? (d, time) => setNewSlot({ date: d, time }) : undefined} />
          </div>
          <div className="md:hidden">{agenda}</div>
        </>
      ) : agenda}

      <Sheet open={!!booking || !!slot || !!newSlot} onOpenChange={(open) => { if (!open) { setSelected(null); setNewSlot(null); } }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>{booking ? t("sessionTitle") : slot ? t("free") : t("newSlot")}</SheetTitle></SheetHeader>
          <div className="px-4 pb-6">
            {booking && <BookingCard booking={booking} viewer={viewer} />}
            {slot && (
              <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm">
                <div>
                  <p className="font-semibold capitalize">{formatDateTime(slot.starts_at)}-{formatTime(slot.ends_at)}</p>
                  <p className="text-muted-foreground">{slot.location}</p>
                </div>
                <DeleteSlotButton slotId={slot.id} />
              </div>
            )}
            {newSlot && (
              <SlotForm key={`${newSlot.date}-${newSlot.time}`} defaults={{ ...newSlot, ...slotDefaults, weekly: false }}
                onCreated={() => setNewSlot(null)} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
