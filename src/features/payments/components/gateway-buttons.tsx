"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mockGatewayAction } from "@/features/payments/actions";
import { useAction } from "@/lib/use-action";

export function GatewayButtons({ paymentId, total, backUrl, isProposal }: {
  paymentId: string; total: number; backUrl: string; isProposal: boolean;
}) {
  const t = useTranslations("pay");
  const router = useRouter();
  const { pending, run } = useAction();

  function pay(success: boolean) {
    run(() => mockGatewayAction(paymentId, success), {
      onSuccess: ({ booked }) => {
        if (booked) {
          toast.success(isProposal ? t("successProposal") : t("success"));
          router.push("/sessions");
        } else if (success) {
          toast.error(t("lost"));
          router.push("/payments");
        } else {
          toast.error(t("failed"));
          router.push(backUrl);
        }
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" disabled={pending} onClick={() => pay(true)}>{t("pay", { total })}</Button>
      <Button variant="outline" disabled={pending} onClick={() => pay(false)}>{t("fail")}</Button>
      <Button asChild variant="link" disabled={pending}><Link href={backUrl}>{t("cancel")}</Link></Button>
    </div>
  );
}
