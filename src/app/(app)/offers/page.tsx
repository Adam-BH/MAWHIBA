import { Plus, Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { getMyCoachProfile, listInclusiveCoachIds } from "@/features/coaches/queries";
import { OfferCard } from "@/features/offers/components/offer-card";
import { OfferFormDialog } from "@/features/offers/components/offer-form-dialog";
import { OfferManageActions } from "@/features/offers/components/offer-manage-actions";
import { listMyOffers } from "@/features/offers/queries";
import { requireRole } from "@/lib/auth";
import { MAX_ACTIVE_OFFERS, SPORTS, type Sport } from "@/lib/config";

export default async function OffersPage() {
  const user = await requireRole(["coach"]);
  const [t, offers, coach, inclusiveIds] = await Promise.all([
    getTranslations("offers"), listMyOffers(user.id), getMyCoachProfile(user.id), listInclusiveCoachIds(),
  ]);
  const canInclusive = inclusiveIds.has(user.id);
  const active = offers.filter((o) => o.is_active);
  const fromPrice = active.length ? Math.min(...active.map((o) => o.price)) : coach?.price_per_session ?? 0;
  const defaultSport = (coach?.sports[0] ?? SPORTS[0]) as Sport;
  const createButton = (
    <OfferFormDialog canInclusive={canInclusive}
      defaults={{ title: "", sport: defaultSport, description: "", duration: coach?.session_duration_min ?? 60,
        price: coach?.price_per_session ?? 40, audience: "tous", isInclusive: false, isActive: active.length < MAX_ACTIVE_OFFERS }}
      trigger={<Button><Plus />{t("new")}</Button>} />
  );

  return (
    <>
      <PageHeader title={t("pageTitle")} description={t("pageSubtitle", { max: MAX_ACTIVE_OFFERS })} actions={createButton} />
      <Alert className="mb-6">
        <Tag />
        <AlertDescription>{t("fromPreview")} <Points value={fromPrice} className="text-primary" /> · {t("activeCount", { count: active.length, max: MAX_ACTIVE_OFFERS })}</AlertDescription>
      </Alert>
      {offers.length === 0 ? (
        <EmptyState icon={Tag} title={t("empty")} description={t("emptyHint")} action={createButton} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} footer={
              <OfferManageActions offerId={o.id} active={o.is_active} hasBookings={o.hasBookings} canInclusive={canInclusive}
                defaults={{ title: o.title, sport: o.sport as Sport, description: o.description, duration: o.duration_min,
                  price: o.price, audience: o.audience, isInclusive: o.is_inclusive, isActive: o.is_active }} />
            } />
          ))}
        </div>
      )}
    </>
  );
}
