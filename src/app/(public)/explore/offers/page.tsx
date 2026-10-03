import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RatingStars } from "@/components/shared/rating-stars";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CoachFilters } from "@/features/coaches/components/coach-filters";
import { OfferCard } from "@/features/offers/components/offer-card";
import { listPublicOffers } from "@/features/offers/queries";
import { OFFER_AUDIENCES } from "@/lib/config";

export async function generateMetadata() {
  const t = await getTranslations("explore");
  return { title: t("title") };
}

type Search = { sport?: string; city?: string; maxPrice?: string; audience?: string; inclusive?: string };

export default async function ExploreOffersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const maxPrice = Number(params.maxPrice);
  const [t, offers] = await Promise.all([
    getTranslations("explore"),
    listPublicOffers({
      sport: params.sport,
      city: params.city,
      maxPrice: Number.isInteger(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
      audience: OFFER_AUDIENCES.find((a) => a === params.audience && a !== "tous"),
      inclusive: params.inclusive === "1",
    }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <Suspense><CoachFilters withAudience /></Suspense>
      <p className="my-4 text-sm text-muted-foreground">{t("results", { count: offers.length })}</p>
      {offers.length === 0 ? <EmptyState icon={SearchX} title={t("empty")} /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <OfferCard key={o.id} offer={o} href={`/coaches/${o.coach.slug ?? o.coach_id}?offer=${o.id}#offres`} coachLine={
              <div className="flex items-center gap-2 border-b pb-2">
                <UserAvatar name={o.coach.profile.full_name} src={o.coach.profile.avatar_url} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.coach.profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{o.coach.profile.city}</p>
                </div>
                <RatingStars rating={Number(o.coach.rating_avg)} />
              </div>
            } />
          ))}
        </div>
      )}
    </>
  );
}
