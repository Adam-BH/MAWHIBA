"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { deleteSlotAction } from "@/features/slots/actions";
import { useAction } from "@/lib/use-action";

export function DeleteSlotButton({ slotId }: { slotId: string }) {
  const t = useTranslations("slots");
  const { pending, run } = useAction();
  return (
    <Button variant="ghost" size="icon" disabled={pending} aria-label={t("delete")}
      onClick={() => run(() => deleteSlotAction(slotId), { success: t("deleted") })}>
      <Trash2 />
    </Button>
  );
}
