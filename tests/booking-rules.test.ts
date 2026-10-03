import { describe, expect, it } from "vitest";
import { allowedActions, canReview, isUpcoming } from "@/lib/booking-rules";

const now = new Date("2026-10-03T12:00:00Z");
const future = new Date("2026-10-04T12:00:00Z");
const past = new Date("2026-10-02T12:00:00Z");
const none = { accept: false, decline: false, cancel: false, complete: false };

describe("booking state machine", () => {
  it("pending: coach accepts or declines before start, client can cancel", () => {
    expect(allowedActions("pending", future, "coach", now)).toEqual({ ...none, accept: true, decline: true });
    expect(allowedActions("pending", future, "client", now)).toEqual({ ...none, cancel: true });
  });

  it("pending after start: coach can only decline (refund), client can't cancel", () => {
    expect(allowedActions("pending", past, "coach", now)).toEqual({ ...none, decline: true });
    expect(allowedActions("pending", past, "client", now)).toEqual(none);
  });

  it("confirmed: client cancels before start, completes after start", () => {
    expect(allowedActions("confirmed", future, "client", now)).toEqual({ ...none, cancel: true });
    expect(allowedActions("confirmed", past, "client", now)).toEqual({ ...none, complete: true });
  });

  it("confirmed: admin can force-complete anytime, coach can't complete", () => {
    expect(allowedActions("confirmed", future, "admin", now)).toEqual({ ...none, complete: true });
    expect(allowedActions("confirmed", past, "coach", now)).toEqual(none);
  });

  it.each(["completed", "declined", "cancelled"] as const)("%s is terminal", (status) => {
    for (const actor of ["client", "coach", "admin"] as const) {
      expect(allowedActions(status, future, actor, now)).toEqual(none);
      expect(allowedActions(status, past, actor, now)).toEqual(none);
    }
  });

  it("reviews only once, only when completed", () => {
    expect(canReview("completed", false)).toBe(true);
    expect(canReview("completed", true)).toBe(false);
    expect(canReview("confirmed", false)).toBe(false);
  });

  it("upcoming = live and in the future", () => {
    expect(isUpcoming("confirmed", future, now)).toBe(true);
    expect(isUpcoming("pending", future, now)).toBe(true);
    expect(isUpcoming("confirmed", past, now)).toBe(false);
    expect(isUpcoming("cancelled", future, now)).toBe(false);
  });
});
