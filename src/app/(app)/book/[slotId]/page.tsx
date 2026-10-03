import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { Receipt } from "@/components/shared/receipt";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CheckoutForm } from "@/features/bookings/components/checkout-form";
import { OfferCard } from "@/features/offers/components/offer-card";
import { listCoachOffers } from "@/features/offers/queries";
import { getBookableSlot } from "@/features/slots/queries";
import { requireRole } from "@/lib/auth";
import { INSURANCE_FEE } from "@/lib/config";
import { formatDay, formatTime } from "@/lib/dates";
import { checkoutTotal } from "@/lib/money";
import { uuid } from "@/lib/validations/forms";

export default async function BookPage({ params, searchParams }: {
  params: Promise<{ slotId: string }>;
  searchParams: Promise<{ offer?: string }>;
}) {
  await requireRole(["client"]);
  const [{ slotId }, { offer: offerId }, t] = await Promise.all([params, searchParams, getTranslations("checkout")]);
  const slot = uuid.safeParse(slotId).success ? await getBookableSlot(slotId) : null;
  if (!slot) {
    return <EmptyState title={t("unavailable")} action={<Button asChild><Link href="/coaches">{t("back")}</Link></Button>} />;
  }
  const offers = await listCoachOffers(slot.coach.user_id);
  const offer = offers.find((o) => o.id === offerId);

  // Coaches with offers are booked through an offer: ask for one if missing.
  if (offers.length > 0 && !offer) {
    return (
      <div className="mx-auto max-w-xl">
        <PageHeader title={t("chooseOffer")} description={t("chooseOfferHint")} />
        <div className="grid gap-3">
          {offers.map((o) => <OfferCard key={o.id} offer={o} href={`/book/${slot.id}?offer=${o.id}`} />)}
        </div>
      </div>
    );
  }

  const price = offer?.price ?? slot.coach.price_per_session;
  const total = checkoutTotal(price);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("title")} />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <UserAvatar name={slot.coach.profile.full_name} src={slot.coach.profile.avatar_url} className="size-12" />
          <div>
            <CardTitle>{slot.coach.profile.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{offer ? `${offer.title} · ${offer.duration_min} min` : slot.coach.sports.join(" · ")}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-1 text-sm">
            <p className="flex items-center gap-2 capitalize"><Clock className="size-4 text-muted-foreground" />{formatDay(slot.starts_at)} · {formatTime(slot.starts_at)}-{formatTime(slot.ends_at)}</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{slot.location}</p>
          </div>
          <Separator />
          <Receipt
            lines={[
              { label: offer?.title ?? t("session"), value: <Price value={price} /> },
              { label: t("insurance"), value: <Price value={INSURANCE_FEE} /> },
            ]}
            total={{ label: t("total"), value: <Price value={total} className="font-semibold" /> }}
          />
          <CheckoutForm slotId={slot.id} offerId={offer?.id} total={total} />
        </CardContent>
      </Card>
    </div>
  );
}
