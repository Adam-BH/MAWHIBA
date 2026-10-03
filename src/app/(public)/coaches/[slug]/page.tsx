import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AthleteCard } from "@/components/shared/athlete-card";
import { Points } from "@/components/shared/points";
import { AvailableSlots } from "@/features/coaches/components/available-slots";
import { ProfileSections } from "@/features/cv/components/profile-sections";
import { ShareButtons } from "@/features/cv/components/share-buttons";
import { getCoachFull, resolveCoach, strengthOf } from "@/features/cv/queries";
import { OfferCard } from "@/features/offers/components/offer-card";
import { listCoachOffers } from "@/features/offers/queries";
import { ReviewList } from "@/features/reviews/components/review-list";
import { listCoachReviews } from "@/features/reviews/queries";
import { listAvailableSlots } from "@/features/slots/queries";
import { getCurrentUser } from "@/lib/auth";
import { athleteCardData } from "@/lib/athlete-card";
import { STRENGTH_COMPLETE_FROM } from "@/lib/profile-strength";
import { publicStorageUrl, siteUrl } from "@/lib/storage-url";

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
  const cover = publicStorageUrl("covers", coach.cover_path);
  const profileUrl = siteUrl(`/coaches/${coach.slug}`);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative">
        <div className="h-40 rounded-3xl bg-secondary bg-cover bg-center sm:h-56" style={cover ? { backgroundImage: `url(${cover})` } : undefined} />
        <div className="-mt-20 flex flex-col gap-4 px-2 sm:px-6 md:flex-row md:items-end">
          <AthleteCard card={card} className="w-full md:w-96" />
          <div className="flex flex-wrap gap-2 md:pb-2">
            <Button asChild size="lg"><a href="#disponibilites"><CalendarCheck />{tp("book")}</a></Button>
            {coach.cv_public && <Button asChild size="lg" variant="outline"><Link href={`/cv/${coach.slug}`}><FileText />{tp("seeCv")}</Link></Button>}
            <ShareButtons url={profileUrl} text={tp("shareText", { name: coach.profile.full_name })} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          <ProfileSections coach={coach} />
          {offers.length > 0 && (
            <section id="offres" className="scroll-mt-20">
              <h2 className="mb-1 text-xl font-semibold">{t("offers")}</h2>
              <p className="mb-3 text-sm text-muted-foreground">{t("offersHint")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {offers.map((o) => <OfferCard key={o.id} offer={o} href={`/coaches/${coach.slug}?offer=${o.id}#offres`} selected={o.id === selected?.id} />)}
              </div>
            </section>
          )}
          <section id="avis" className="scroll-mt-20">
            <h2 className="mb-3 text-xl font-semibold">{t("reviews")}</h2>
            <ReviewList reviews={reviews} />
          </section>
        </div>
        <aside id="disponibilites" className="scroll-mt-20 lg:sticky lg:top-20 lg:self-start">
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
            <CardContent><AvailableSlots slots={slots} canBook={!viewer || viewer.role === "client"} offerId={selected?.id} /></CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
