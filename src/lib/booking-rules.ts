import type { Enums } from "@/lib/supabase/database.types";

export type BookingStatus = Enums<"booking_status">;
type Actor = "client" | "coach" | "admin";

// Mirror of the RPC guards, used to decide which actions the UI offers.
export function allowedActions(status: BookingStatus, startsAt: Date, actor: Actor, now = new Date()) {
  const started = startsAt <= now;
  return {
    accept: actor === "coach" && status === "pending" && !started,
    decline: actor === "coach" && status === "pending",
    cancel: actor === "client" && (status === "pending" || status === "confirmed") && !started,
    complete: status === "confirmed" && (actor === "admin" || (actor === "client" && started)),
  };
}

export function canReview(status: BookingStatus, hasReview: boolean) {
  return status === "completed" && !hasReview;
}

export function isUpcoming(status: BookingStatus, startsAt: Date, now = new Date()) {
  return (status === "pending" || status === "confirmed") && startsAt > now;
}
