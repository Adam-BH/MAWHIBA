import { notFound } from "next/navigation";
import { MapPin, Medal } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoachBadges } from "@/components/shared/coach-badges";
import { Points } from "@/components/shared/points";
import { RatingStars } from "@/components/shared/rating-stars";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AvailableSlots } from "@/features/coaches/components/available-slots";
import { getCoach } from "@/features/coaches/queries";
import { ReviewList } from "@/features/reviews/components/review-list";
import { listCoachReviews } from "@/features/reviews/queries";
import { listAvailableSlots } from "@/features/slots/queries";
import { OfferCard } from "@/features/offers/components/offer-card";
import { listCoachOffers } from "@/features/offers/queries";
import { getCurrentUser } from "@/lib/auth";
import { uuid } from "@/lib/validations/forms";

export default async function CoachPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ offer?: string }>;
}) {
  const [{ id }, { offer: offerParam }] = await Promise.all([params, searchParams]);
  if (!uuid.safeParse(id).success) notFound();
  const [coach, slots, reviews, offers, user, t] = await Promise.all([
    getCoach(id), listAvailableSlots(id), listCoachReviews(id), listCoachOffers(id), getCurrentUser(), getTranslations("coaches"),
  ]);
  if (!coach) notFound();
  // Booking = offer + slot. Defaults to the cheapest offer.
  const selected = offers.find((o) => o.id === offerParam) ?? offers[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={coach.profile.full_name} src={coach.profile.avatar_url} className="size-24" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-bold">{coach.profile.full_name}</h1>
            <p className="text-muted-foreground">{coach.sports.join(" · ")}</p>
            {coach.profile.city && <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{coach.profile.city}</p>}
            <RatingStars rating={Number(coach.rating_avg)} count={coach.rating_count} />
            <CoachBadges verified={coach.verified} inclusive={coach.inclusive} />
          </div>
        </section>
        {coach.headline && <p className="text-lg font-medium">{coach.headline}</p>}
        {coach.achievements && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Medal className="size-5 text-accent" />{t("achievements")}</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-line">{coach.achievements}</p></CardContent>
          </Card>
        )}
        {coach.bio && (
          <Card>
            <CardHeader><CardTitle>{t("about")}</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-line text-muted-foreground">{coach.bio}</p></CardContent>
          </Card>
        )}
        {offers.length > 0 && (
          <section id="offres" className="scroll-mt-20">
            <h2 className="mb-1 text-xl font-bold">{t("offers")}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{t("offersHint")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {offers.map((o) => <OfferCard key={o.id} offer={o} href={`/coaches/${id}?offer=${o.id}#offres`} selected={o.id === selected?.id} />)}
            </div>
          </section>
        )}
        <section>
          <h2 className="mb-3 text-xl font-bold">{t("reviews")}</h2>
          <ReviewList reviews={reviews} />
        </section>
      </div>
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("availability")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selected ? (
                <>{selected.title} · <Points value={selected.price} className="text-primary" /> · {t("duration", { min: selected.duration_min })}</>
              ) : (
                <><Points value={coach.price_per_session} className="text-primary" /> {t("perSession")} · {t("duration", { min: coach.session_duration_min })}</>
              )}
            </p>
          </CardHeader>
          <CardContent><AvailableSlots slots={slots} canBook={!user || user.role === "client"} offerId={selected?.id} /></CardContent>
        </Card>
      </aside>
    </div>
  );
}
