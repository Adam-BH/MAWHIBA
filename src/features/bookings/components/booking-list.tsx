import { EmptyState } from "@/components/shared/empty-state";
import { BookingCard } from "@/features/bookings/components/booking-card";
import type { BookingRow } from "@/features/bookings/queries";

export function BookingList({ bookings, viewer, emptyTitle, emptyAction }: {
  bookings: BookingRow[];
  viewer: "client" | "coach" | "admin";
  emptyTitle: string;
  emptyAction?: React.ReactNode;
}) {
  if (bookings.length === 0) return <EmptyState title={emptyTitle} action={emptyAction} />;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {bookings.map((b) => <BookingCard key={b.id} booking={b} viewer={viewer} />)}
    </div>
  );
}
