"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { OfferFormDialog } from "@/features/offers/components/offer-form-dialog";
import { deleteOfferAction, setOfferActiveAction } from "@/features/offers/actions";
import type { OfferInput } from "@/lib/validations/offers";
import { useAction } from "@/lib/use-action";

export function OfferManageActions({ offerId, active, hasBookings, defaults, canInclusive }: {
  offerId: string;
  active: boolean;
  hasBookings: boolean;
  defaults: OfferInput;
  canInclusive: boolean;
}) {
  const t = useTranslations("offers");
  const { pending, run } = useAction();
  return (
    <div className="flex flex-wrap gap-2 border-t pt-3">
      <Button size="sm" variant="outline" disabled={pending}
        onClick={() => run(() => setOfferActiveAction(offerId, !active), { success: active ? t("deactivated") : t("activated") })}>
        {active ? <EyeOff /> : <Eye />}{active ? t("deactivate") : t("activate")}
      </Button>
      <OfferFormDialog offerId={offerId} defaults={defaults} canInclusive={canInclusive}
        trigger={<Button size="sm" variant="ghost"><Pencil />{t("edit")}</Button>} />
      {!hasBookings && (
        <Button size="sm" variant="ghost" disabled={pending} aria-label={t("delete")}
          onClick={() => confirm(t("deleteConfirm")) && run(() => deleteOfferAction(offerId), { success: t("deleted") })}>
          <Trash2 />{t("delete")}
        </Button>
      )}
    </div>
  );
}
