import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { MetricsGrid } from "@/features/admin/components/metrics-grid";
import { getMetrics } from "@/features/admin/queries";

export async function AdminDashboard() {
  const [t, metrics] = await Promise.all([getTranslations("admin"), getMetrics()]);
  return (
    <>
      <PageHeader title={t("title")} actions={
        <>
          <Button asChild><Link href="/admin/coaches">{t("goVerify", { count: metrics.coaches_pending })}</Link></Button>
          <Button asChild variant="outline"><Link href="/star-tracks">{t("goStarTracks")}</Link></Button>
        </>
      } />
      <MetricsGrid metrics={metrics} />
    </>
  );
}
