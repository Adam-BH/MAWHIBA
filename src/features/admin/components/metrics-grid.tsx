import { getTranslations } from "next-intl/server";
import { Price } from "@/components/shared/price";
import { Section } from "@/components/shared/section";
import { Stat } from "@/components/shared/stat";
import type { Metrics } from "@/features/admin/queries";

/** Every paid booking is insured: pending (awaiting the coach), confirmed and completed. */
export function insuredSessions(m: Metrics) {
  const b = m.bookings_by_status;
  return (b.pending ?? 0) + (b.confirmed ?? 0) + (b.completed ?? 0);
}

export async function MetricsGrid({ metrics: m }: { metrics: Metrics }) {
  const t = await getTranslations("admin.metrics");
  return (
    <>
      <Section title={t("money")} className="mt-0">
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={t("gmv")} value={<Price value={m.gmv} />} />
          <Stat label={t("commission")} value={<Price value={m.commission} />} />
          <Stat label={t("insurance")} value={<Price value={m.insurance} />} />
          <Stat label={t("coachDue")} value={<Price value={m.coach_due} />} />
          <Stat label={t("collected")} value={<Price value={m.collected} />} />
          <Stat label={t("refunded")} value={<Price value={m.refunded} />} />
        </div>
      </Section>
      <Section title={t("activity")}>
        <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={t("insuredSessions")} value={insuredSessions(m)} />
          <Stat label={t("coachesVerified")} value={m.coaches_verified} hint={t("ofTotal", { total: m.coaches_total })} />
          <Stat label={t("coachesPending")} value={m.coaches_pending} />
          <Stat label={t("clients")} value={m.clients} />
          <Stat label={t("openRequests")} value={m.open_requests} />
          <Stat label={t("conversion")} value={`${m.request_conversion_pct} %`} hint={t("conversionHint")} />
        </div>
      </Section>
    </>
  );
}
