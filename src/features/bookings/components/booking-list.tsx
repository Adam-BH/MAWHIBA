import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { BookingCard } from "@/features/bookings/components/booking-card";
import type { BookingRow } from "@/features/bookings/queries";

export function BookingList({ bookings, viewer, emptyIcon, emptyTitle, emptyAction }: {
  bookings: BookingRow[];
  viewer: "client" | "coach" | "admin";
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyAction?: React.ReactNode;
}) {
  if (bookings.length === 0) return <EmptyState icon={emptyIcon} title={emptyTitle} action={emptyAction} />;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {bookings.map((b) => <BookingCard key={b.id} booking={b} viewer={viewer} />)}
    </div>
  );
}
