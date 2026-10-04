import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { AthleteCard } from "@/components/shared/athlete-card";
import { Price } from "@/components/shared/price";
import { AvailableSlots } from "@/features/coaches/components/available-slots";
import { ProfileSections } from "@/features/cv/components/profile-sections";
import { ShareButtons } from "@/features/cv/components/share-buttons";
import { CoachMiniMap } from "@/features/map/components/coach-mini-map";
import { getCoachFull, resolveCoach, strengthOf } from "@/features/cv/queries";
import { OfferCard } from "@/features/offers/components/offer-card";
import { listCoachOffers } from "@/features/offers/queries";
import { ReviewList } from "@/features/reviews/components/review-list";
import { listCoachReviews } from "@/features/reviews/queries";
import { listAvailableSlots } from "@/features/slots/queries";
import { getCurrentUser } from "@/lib/auth";
import { athleteCardData } from "@/lib/athlete-card";
import { STRENGTH_COMPLETE_FROM } from "@/lib/profile-strength";
import { siteUrl } from "@/lib/storage-url";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ offer?: string }> };

async function load(param: string) {
  const ref = await resolveCoach(param);
  if (!ref) return null;
  const [coach, viewer] = await Promise.all([getCoachFull(ref.user_id), getCurrentUser()]);
  // Unverified profiles are visible to their owner (preview) and admins only.
  if (!coach || !(coach.verified || viewer?.id === coach.user_id || viewer?.role === "admin")) return null;
  return { coach, viewer };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data?.coach.slug) return {};
  const { coach } = data;
  const description = coach.tagline ?? coach.headline ?? undefined;
  return {
    title: coach.profile.full_name,
    description,
    openGraph: { title: coach.profile.full_name, description, images: [{ url: `/api/card/${coach.slug}/og`, width: 1200, height: 630 }] },
  };
}

export default async function CoachPage({ params, searchParams }: Props) {
  const [{ slug }, { offer: offerParam }] = await Promise.all([params, searchParams]);
  const data = await load(slug);
  if (!data) notFound();
  const { coach, viewer } = data;

  const [slots, reviews, offers, t] = await Promise.all([
    listAvailableSlots(coach.user_id), listCoachReviews(coach.user_id), listCoachOffers(coach.user_id), getTranslations("coaches"),
  ]);
  const tp = await getTranslations("publicProfile");
  const selected = offers.find((o) => o.id === offerParam) ?? offers[0];
  const card = athleteCardData(coach, strengthOf(coach).score, STRENGTH_COMPLETE_FROM);
  const profileUrl = siteUrl(`/coaches/${coach.slug}`);

  return (
    <div className="grid gap-10 lg:grid-cols-[360px_1fr]">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <AthleteCard card={card} />
        <Button asChild size="lg"><a href={offers.length ? "#offres" : "#disponibilites"}>{tp("book")}</a></Button>
        <div className="flex flex-wrap justify-center gap-1">
          {coach.cv_public && <Button asChild variant="ghost" size="sm"><Link href={`/cv/${coach.slug}`}><FileText />{tp("seeCv")}</Link></Button>}
          <ShareButtons url={profileUrl} text={tp("shareText", { name: coach.profile.full_name })} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col gap-12">
        {offers.length > 0 && (
          <section id="offres" className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold">{t("offers")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {offers.map((o) => <OfferCard key={o.id} offer={o} href={`/coaches/${coach.slug}?offer=${o.id}#offres`} selected={o.id === selected?.id} />)}
            </div>
          </section>
        )}
        <section id="disponibilites" className="scroll-mt-20">
          <h2 className="text-xl font-semibold">{t("availability")}</h2>
          <p className="mt-1 mb-4 text-sm text-muted-foreground">
            {selected
              ? <>{selected.title} · <Price value={selected.price} /> · {t("duration", { min: selected.duration_min })}</>
              : <><Price value={coach.price_per_session} /> {t("perSession")} · {t("duration", { min: coach.session_duration_min })}</>}
          </p>
          <AvailableSlots slots={slots} canBook={!viewer || viewer.role === "client"} offerId={selected?.id} />
        </section>
        <ProfileSections coach={coach} />
        {coach.map_lat !== null && coach.map_lng !== null && (
          <section id="lieu" className="scroll-mt-20">
            <h2 className="mb-1 text-xl font-semibold">{tp("area")}</h2>
            <p className="mb-4 text-sm text-muted-foreground">{tp("areaHint", { km: coach.service_radius_km })}</p>
            <CoachMiniMap label={tp("area")} center={[coach.map_lat, coach.map_lng]} zoom={coach.service_radius_km > 15 ? 9 : coach.service_radius_km > 6 ? 10 : 11}
              circle={{ lat: coach.map_lat, lng: coach.map_lng, radiusKm: coach.service_radius_km }}
              href={`/coaches?view=map&near=${coach.map_lat},${coach.map_lng}`} />
          </section>
        )}
        <section id="avis" className="scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold">{t("reviews")}</h2>
          <ReviewList reviews={reviews} />
        </section>
      </div>
    </div>
  );
}
