import Link from "next/link";
import { BadgeCheck, CalendarClock, CalendarX, Clock, Coins, FileWarning, Inbox, TrendingUp } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CoachBadges } from "@/components/shared/coach-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Points } from "@/components/shared/points";
import { StatCard } from "@/components/shared/stat-card";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { listCoachBookings } from "@/features/bookings/queries";
import { getMyCoachProfile, listInclusiveCoachIds, profileCompleteness } from "@/features/coaches/queries";
import { getCoachEarnings } from "@/features/wallet/queries";
import type { CurrentUser } from "@/lib/auth";
import { isUpcoming } from "@/lib/booking-rules";

export async function CoachDashboard({ user }: { user: CurrentUser }) {
  const [t, coach, bookings, earnings, inclusiveIds] = await Promise.all([
    getTranslations("dashboard"), getMyCoachProfile(user.id), listCoachBookings(user.id), getCoachEarnings(user.id), listInclusiveCoachIds(),
  ]);
  if (!coach) return null;
  const completeness = profileCompleteness(coach, user);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter((b) => b.status === "confirmed" && isUpcoming(b.status, new Date(b.slot.starts_at)))
    .sort((a, b) => a.slot.starts_at.localeCompare(b.slot.starts_at)).slice(0, 4);
  const status = coach.verified ? "verified" : coach.proof_path ? "pending" : "missing";

  return (
    <>
      <PageHeader title={t("hello", { name: user.full_name.split(" ")[0] })} description={t("coachSubtitle")} />
      <Alert className={status === "verified" ? "border-success/40 bg-success/10" : "border-warning/50 bg-warning/15"}>
        {status === "verified" ? <BadgeCheck /> : status === "pending" ? <Clock /> : <FileWarning />}
        <AlertTitle>{t(`verification.${status}Title`)}</AlertTitle>
        <AlertDescription>
          {t(`verification.${status}Text`)}
          {status === "missing" && <Button asChild size="sm" className="mt-2"><Link href="/profile">{t("completeProfile")}</Link></Button>}
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Inbox} tone="warning" label={t("pendingRequests")} value={pending} />
        <StatCard icon={CalendarClock} label={t("upcomingCount")} value={upcoming.length} />
        <StatCard icon={TrendingUp} tone="accent" label={t("earningsMonth")} value={<Points value={earnings.month} />} />
        <StatCard icon={Coins} tone="success" label={t("earningsTotal")} value={<Points value={earnings.total} />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("upcoming")}</h2>
            <Button asChild variant="link"><Link href="/sessions">{t("seeAll")}</Link></Button>
          </div>
          {upcoming.length ? (
            <div className="grid gap-3">{upcoming.map((b) => <BookingCard key={b.id} booking={b} viewer="coach" />)}</div>
          ) : (
            <EmptyState icon={CalendarX} title={t("noUpcoming")} action={<Button asChild variant="outline"><Link href="/slots">{t("addSlots")}</Link></Button>} />
          )}
        </section>
        <Card className="self-start">
          <CardHeader><CardTitle>{t("profileCard")}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-3"><Progress value={completeness} className="flex-1" /><span className="text-sm font-semibold">{completeness}%</span></div>
            <CoachBadges verified={coach.verified} inclusive={inclusiveIds.has(user.id)} />
            {!inclusiveIds.has(user.id) && <Button asChild variant="outline" size="sm"><Link href="/learn">{t("earnBadge")}</Link></Button>}
            <Button asChild variant="ghost" size="sm"><Link href="/profile">{t("editProfile")}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
