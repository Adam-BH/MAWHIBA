import { BadgeCheck, CalendarCheck, Clock, Coins, HandCoins, Megaphone, Percent, Receipt, Send, ShieldCheck, Tag, TrendingUp, Undo2, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Price } from "@/components/shared/price";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metrics } from "@/features/admin/queries";

const STATUSES = ["pending", "confirmed", "completed", "declined", "cancelled"] as const;

export async function MetricsGrid({ metrics: m }: { metrics: Metrics }) {
  const t = await getTranslations("admin.metrics");
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BadgeCheck} label={t("coachesVerified")} value={m.coaches_verified} hint={t("ofTotal", { total: m.coaches_total })} />
        <StatCard icon={Clock} tone="warning" label={t("coachesPending")} value={m.coaches_pending} />
        <StatCard icon={Users} label={t("clients")} value={m.clients} />
        <StatCard icon={TrendingUp} tone="accent" label={t("gmv")} value={<Price value={m.gmv} />} />
        <StatCard icon={Coins} tone="success" label={t("commission")} value={<Price value={m.commission} />} />
        <StatCard icon={ShieldCheck} tone="success" label={t("insurance")} value={<Price value={m.insurance} />} />
        <StatCard icon={Receipt} label={t("collected")} value={<Price value={m.collected} />} />
        <StatCard icon={Undo2} label={t("refunded")} value={<Price value={m.refunded} />} />
        <StatCard icon={HandCoins} tone="warning" label={t("coachDue")} value={<Price value={m.coach_due} />} />
        <StatCard icon={CalendarCheck} label={t("bookingsTotal")}
          value={Object.values(m.bookings_by_status).reduce((a, b) => a + (b ?? 0), 0)} />
        <StatCard icon={Tag} label={t("activeOffers")} value={m.active_offers} />
        <StatCard icon={Megaphone} tone="accent" label={t("openRequests")} value={m.open_requests} />
        <StatCard icon={Send} label={t("proposals")} value={m.proposals_total} />
        <StatCard icon={Percent} tone="success" label={t("conversion")} value={`${m.request_conversion_pct} %`} hint={t("conversionHint")} />
      </div>
      <Card>
        <CardHeader><CardTitle>{t("byStatus")}</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <StatusBadge status={s} />
              <span className="font-semibold">{m.bookings_by_status[s] ?? 0}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
