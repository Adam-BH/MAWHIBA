import Link from "next/link";
import { CalendarX, Clock, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CheckoutForm } from "@/features/bookings/components/checkout-form";
import { getBookableSlot } from "@/features/slots/queries";
import { getBalance } from "@/features/wallet/queries";
import { requireRole } from "@/lib/auth";
import { formatDay, formatTime } from "@/lib/dates";
import { checkoutTotal } from "@/lib/money";
import { INSURANCE_FEE } from "@/lib/config";
import { uuid } from "@/lib/validations/forms";

export default async function BookPage({ params }: { params: Promise<{ slotId: string }> }) {
  const user = await requireRole(["client"]);
  const { slotId } = await params;
  const t = await getTranslations("checkout");
  const slot = uuid.safeParse(slotId).success ? await getBookableSlot(slotId) : null;
  if (!slot) {
    return <EmptyState icon={CalendarX} title={t("unavailable")} action={<Button asChild><Link href="/coaches">{t("back")}</Link></Button>} />;
  }
  const price = slot.coach.price_per_session;
  const total = checkoutTotal(price);
  const balance = await getBalance(user.id);

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("title")} />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <UserAvatar name={slot.coach.profile.full_name} src={slot.coach.profile.avatar_url} className="size-12" />
          <div>
            <CardTitle>{slot.coach.profile.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">{slot.coach.sports.join(" · ")}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-1 text-sm">
            <p className="flex items-center gap-2 capitalize"><Clock className="size-4 text-muted-foreground" />{formatDay(slot.starts_at)} · {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}</p>
            <p className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" />{slot.location}</p>
          </div>
          <Separator />
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between"><dt>{t("session")}</dt><dd><Points value={price} /></dd></div>
            <div className="flex justify-between"><dt>{t("insurance")}</dt><dd><Points value={INSURANCE_FEE} /></dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>{t("total")}</dt><dd><Points value={total} className="text-primary" /></dd></div>
          </dl>
          <p className="rounded-lg bg-muted p-3 text-center text-sm font-medium">{t("summary", { price, fee: INSURANCE_FEE, total })}</p>
          {balance >= total && <p className="text-sm text-muted-foreground">{t("balanceLine", { balance, after: balance - total })}</p>}
          <CheckoutForm slotId={slot.id} total={total} balance={balance} />
        </CardContent>
      </Card>
    </div>
  );
}
