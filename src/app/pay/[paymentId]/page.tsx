import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { InsuredBadge } from "@/components/shared/insured-badge";
import { Price } from "@/components/shared/price";
import { Receipt } from "@/components/shared/receipt";
import { GatewayButtons } from "@/features/payments/components/gateway-buttons";
import { getPayment, paymentStatus } from "@/features/payments/queries";
import { requireRole } from "@/lib/auth";
import { formatDateTime, formatTime } from "@/lib/dates";
import { isMockGateway } from "@/lib/payments/konnect";
import { uuid } from "@/lib/validations/forms";

/** Stand-in for Konnect's hosted payment page (mock gateway only). */
export default async function PayPage({ params }: { params: Promise<{ paymentId: string }> }) {
  await requireRole(["client"]);
  const { paymentId } = await params;
  const payment = isMockGateway && uuid.safeParse(paymentId).success ? await getPayment(paymentId) : null;
  if (!payment) notFound();
  const t = await getTranslations("pay");
  const status = paymentStatus(payment);
  const backUrl = payment.proposal ? `/requests/${payment.proposal.request_id}`
    : `/book/${payment.slot_id}${payment.offer_id ? `?offer=${payment.offer_id}` : ""}`;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-sm rounded-4xl bg-card p-6 shadow-lift sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-display font-semibold"><Lock className="size-4" />{t("gateway")}</span>
          <InsuredBadge />
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">{t("merchant")}</dt><dd className="font-medium">MAWHIBA</dd></div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("title")}</dt>
            <dd className="text-end">{t("description", { coach: payment.slot.coach.profile.full_name })}<br />
              <span className="capitalize text-muted-foreground">{formatDateTime(payment.slot.starts_at)}</span></dd>
          </div>
        </dl>
        <Receipt className="my-6"
          lines={[{ label: t("session"), value: <Price value={payment.price} /> }, { label: t("insurance"), value: <Price value={payment.insurance_fee} /> }]}
          total={{ label: t("amount"), value: <Price value={payment.amount} className="font-semibold" /> }} />
        {status === "pending" ? (
          <>
            <p className="mb-4 text-center text-xs text-muted-foreground">{t("expiresIn", { time: formatTime(payment.expires_at) })} {t("testMode")}</p>
            <GatewayButtons paymentId={payment.id} total={payment.amount} backUrl={backUrl} isProposal={!!payment.proposal} />
          </>
        ) : (
          <div className="flex flex-col gap-3 text-center">
            <p className="text-sm">{status === "expired" ? t("expired") : t("done")}</p>
            <Button asChild variant="outline"><Link href={status === "expired" ? backUrl : "/sessions"}>{t("cancel")}</Link></Button>
          </div>
        )}
      </div>
    </div>
  );
}
