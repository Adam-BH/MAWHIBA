import Link from "next/link";
import { ListChecks } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { BookingList } from "@/features/bookings/components/booking-list";
import { listAllBookings } from "@/features/bookings/queries";
import { requireRole } from "@/lib/auth";
import type { BookingStatus } from "@/lib/booking-rules";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "completed", "declined", "cancelled"];

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireRole(["admin"]);
  const { status: raw } = await searchParams;
  const status = STATUSES.find((s) => s === raw);
  const [t, ts, bookings] = await Promise.all([getTranslations("admin.bookings"), getTranslations("status"), listAllBookings(status)]);

  return (
    <>
      <PageHeader title={t("title")} />
      <nav className="mb-4 flex flex-wrap gap-2" aria-label={t("filter")}>
        <Button asChild size="sm" variant={!status ? "default" : "outline"}><Link href="/admin/bookings">{t("all")}</Link></Button>
        {STATUSES.map((s) => (
          <Button key={s} asChild size="sm" variant={status === s ? "default" : "outline"}><Link href={`/admin/bookings?status=${s}`}>{ts(s)}</Link></Button>
        ))}
      </nav>
      <BookingList bookings={bookings} viewer="admin" emptyIcon={ListChecks} emptyTitle={t("empty")} />
    </>
  );
}
