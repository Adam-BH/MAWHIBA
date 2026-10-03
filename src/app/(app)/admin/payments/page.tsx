import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentList } from "@/features/payments/components/payment-list";
import { listPayments } from "@/features/payments/queries";
import { requireRole } from "@/lib/auth";

export default async function AdminPaymentsPage() {
  await requireRole(["admin"]);
  const [t, payments] = await Promise.all([getTranslations("admin.payments"), listPayments()]);
  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <PaymentList payments={payments} showClient />
    </>
  );
}
