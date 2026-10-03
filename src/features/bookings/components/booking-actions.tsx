"use client";

import { Check, CheckCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cancelBookingAction, completeBookingAction, respondBookingAction } from "@/features/bookings/actions";
import { useAction } from "@/lib/use-action";

type Allowed = { accept: boolean; decline: boolean; cancel: boolean; complete: boolean };

export function BookingActions({ bookingId, allowed }: { bookingId: string; allowed: Allowed }) {
  const t = useTranslations("sessions.actions");
  const { pending, run } = useAction();

  return (
    <div className="flex flex-wrap gap-2">
      {allowed.accept && (
        <Button size="sm" disabled={pending} onClick={() => run(() => respondBookingAction(bookingId, true), { success: t("accepted") })}>
          <Check />{t("accept")}
        </Button>
      )}
      {allowed.decline && (
        <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => respondBookingAction(bookingId, false), { success: t("declined") })}>
          <X />{t("decline")}
        </Button>
      )}
      {allowed.complete && (
        <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" disabled={pending}
          onClick={() => run(() => completeBookingAction(bookingId), { success: t("completed") })}>
          <CheckCheck />{t("complete")}
        </Button>
      )}
      {allowed.cancel && (
        <Button size="sm" variant="destructive" disabled={pending}
          onClick={() => confirm(t("cancelConfirm")) && run(() => cancelBookingAction(bookingId), { success: t("cancelled") })}>
          <X />{t("cancel")}
        </Button>
      )}
    </div>
  );
}
