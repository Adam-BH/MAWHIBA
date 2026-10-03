"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { closeRequestAction } from "@/features/requests/actions";
import { useAction } from "@/lib/use-action";

export function CloseRequestButton({ requestId, size = "default" }: { requestId: string; size?: "default" | "sm" }) {
  const t = useTranslations("requests");
  const { pending, run } = useAction();
  return (
    <Button variant="outline" size={size} disabled={pending}
      onClick={() => confirm(t("closeConfirm")) && run(() => closeRequestAction(requestId), { success: t("closed") })}>
      <X />{t("close")}
    </Button>
  );
}
