import { Clock, MapPin, MessageSquareText, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Price } from "@/components/shared/price";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { BookingActions } from "@/features/bookings/components/booking-actions";
import { ReviewDialog } from "@/features/reviews/components/review-dialog";
import type { BookingRow } from "@/features/bookings/queries";
import { allowedActions, canReview } from "@/lib/booking-rules";
import { formatDateTime, formatTime } from "@/lib/dates";

export function BookingCard({ booking, viewer }: { booking: BookingRow; viewer: "client" | "coach" | "admin" }) {
  const t = useTranslations("sessions");
  const other = viewer === "coach" ? booking.client : booking.coach;
  const allowed = allowedActions(booking.status, new Date(booking.slot.starts_at), viewer);
  const reviewable = viewer === "client" && canReview(booking.status, !!booking.review);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <UserAvatar name={other.full_name} src={other.avatar_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{other.full_name}</p>
            {viewer === "admin" && <p className="truncate text-xs text-muted-foreground">{t("clientLabel", { name: booking.client.full_name })}</p>}
            <p className="flex items-center gap-1 text-sm capitalize text-muted-foreground">
              <Clock className="size-3.5" />{formatDateTime(booking.slot.starts_at)}-{formatTime(booking.slot.ends_at)}
            </p>
            <p className="flex items-center gap-1 truncate text-sm text-muted-foreground"><MapPin className="size-3.5 shrink-0" />{booking.slot.location}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        {viewer !== "client" && booking.note && (
          <p className="flex gap-2 rounded-lg bg-muted p-3 text-sm"><MessageSquareText className="size-4 shrink-0 text-muted-foreground" />{booking.note}</p>
        )}
        {viewer === "coach" && booking.client.phone && booking.status === "confirmed" && (
          <p className="flex items-center gap-1 text-sm"><Phone className="size-3.5" />{booking.client.phone}</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <span className="text-sm text-muted-foreground">
            {viewer === "coach" ? <Price value={booking.price} /> : <Price value={booking.price + booking.insurance_fee} />}
          </span>
          {booking.review && <RatingStars rating={booking.review.rating} />}
          <div className="flex flex-wrap gap-2">
            <BookingActions bookingId={booking.id} allowed={allowed} />
            {reviewable && <ReviewDialog bookingId={booking.id} coachName={booking.coach.full_name} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
