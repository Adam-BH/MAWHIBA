import Link from "next/link";
import { Clock, FileWarning } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Price } from "@/components/shared/price";
import { Section } from "@/components/shared/section";
import { Stat } from "@/components/shared/stat";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { listCoachBookings } from "@/features/bookings/queries";
import { getMyCoachProfile, listInclusiveCoachIds } from "@/features/coaches/queries";
import { MyCvCard } from "@/features/cv/components/my-cv-card";
import { getEarnings } from "@/features/payments/queries";
import { CoachRequestsWidget } from "@/features/requests/components/requests-widget";
import type { CurrentUser } from "@/lib/auth";
import { isUpcoming } from "@/lib/booking-rules";

export async function CoachDashboard({ user }: { user: CurrentUser }) {
  const [t, coach, bookings, earnings, inclusiveIds] = await Promise.all([
    getTranslations("dashboard"), getMyCoachProfile(user.id), listCoachBookings(user.id), getEarnings(), listInclusiveCoachIds(),
  ]);
  if (!coach) return null;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter((b) => b.status === "confirmed" && isUpcoming(b.status, new Date(b.slot.starts_at)))
    .sort((a, b) => a.slot.starts_at.localeCompare(b.slot.starts_at)).slice(0, 4);
  const status = coach.verified ? "verified" : coach.proof_path ? "pending" : "missing";
  const linkClass = "text-sm font-semibold text-primary hover:underline";

  return (
    <>
      <PageHeader title={t("title")} actions={coach.verified && !inclusiveIds.has(user.id) && (
        <Button asChild variant="outline"><Link href="/learn">{t("earnBadge")}</Link></Button>
      )} />
      {status !== "verified" && (
        <Alert className="mb-8 border-warning/50 bg-warning/15">
          {status === "pending" ? <Clock /> : <FileWarning />}
          <AlertTitle>{t(`verification.${status}Title`)}</AlertTitle>
          <AlertDescription>
            {t(`verification.${status}Text`)}
            {status === "missing" && <Button asChild size="sm" className="mt-2"><Link href="/profile">{t("completeProfile")}</Link></Button>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t("pendingRequests")} value={pending} />
        <Stat label={t("upcomingCount")} value={upcoming.length} />
        <Stat label={t("earningsMonth")} value={<Price value={earnings.month} />} />
        <Stat label={t("earningsTotal")} value={<Price value={earnings.total} />} />
      </div>

      <Section title={t("upcoming")} action={<Link href="/sessions" className={linkClass}>{t("seeAll")}</Link>}>
        {upcoming.length ? (
          <div className="grid gap-3 lg:grid-cols-2">{upcoming.map((b) => <BookingCard key={b.id} booking={b} viewer="coach" />)}</div>
        ) : (
          <EmptyState title={t("noUpcoming")} action={<Button asChild variant="outline"><Link href="/sessions?tab=slots">{t("addSlots")}</Link></Button>} />
        )}
      </Section>
      {coach.verified && coach.sports.length > 0 && <CoachRequestsWidget userId={user.id} sports={coach.sports} city={user.city} />}
      <MyCvCard coachId={user.id} />
    </>
  );
}
