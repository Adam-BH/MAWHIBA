"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { registerEventAction } from "@/features/events/actions";
import { useAction } from "@/lib/use-action";

export function RegisterEventButton({ eventId, registered, full }: { eventId: string; registered: boolean; full: boolean }) {
  const t = useTranslations("events");
  const { pending, run } = useAction();

  if (registered) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 font-medium text-success"><Check className="size-4" />{t("registered")}</span>
        <Button variant="link" className="px-0" disabled={pending}
          onClick={() => run(() => registerEventAction(eventId, false), { success: t("unregisteredToast") })}>
          {t("unregister")}
        </Button>
      </div>
    );
  }
  return (
    <Button disabled={pending || full} onClick={() => run(() => registerEventAction(eventId, true), { success: t("registeredToast") })}>
      {full ? t("full") : t("register")}
    </Button>
  );
}
