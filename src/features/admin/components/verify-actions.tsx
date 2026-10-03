"use client";

import { BadgeCheck, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setCoachVerifiedAction } from "@/features/admin/actions";
import { useAction } from "@/lib/use-action";

export function VerifyActions({ coachId, verified }: { coachId: string; verified: boolean }) {
  const t = useTranslations("admin.coaches");
  const { pending, run } = useAction();
  return (
    <div className="flex gap-2">
      {!verified && (
        <Button size="sm" disabled={pending} className="bg-success text-success-foreground hover:bg-success/90"
          onClick={() => run(() => setCoachVerifiedAction(coachId, true), { success: t("verifiedToast") })}>
          <BadgeCheck />{t("verify")}
        </Button>
      )}
      <Button size="sm" variant="outline" disabled={pending}
        onClick={() => run(() => setCoachVerifiedAction(coachId, false), { success: verified ? t("revokedToast") : t("rejectedToast") })}>
        <X />{verified ? t("revoke") : t("reject")}
      </Button>
    </div>
  );
}
