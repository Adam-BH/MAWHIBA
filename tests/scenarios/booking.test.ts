import { afterAll, describe, expect, it } from "vitest";
import { checkoutTotal, splitPayout } from "@/lib/money";
import { admin, cleanup, confirm, enabled, makeCoach, makeUser, payAndBook } from "./helpers";

const paymentOf = async (bookingId: string) =>
  (await admin.from("payments").select("status, amount").eq("booking_id", bookingId).single()).data;
const slotBooked = async (slotId: string) =>
  (await admin.from("slots").select("is_booked").eq("id", slotId).single()).data?.is_booked;

describe.skipIf(!enabled)("scenario: booking and paying a session", () => {
  afterAll(cleanup);

  it("checkout → pay → coach accepts → admin completes: coach earns the session minus commission", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const boss = await makeUser("admin");

    const bookingId = await payAndBook(client.db, coach.slotIds[0], coach.offerId);
    expect(await paymentOf(bookingId)).toEqual({ status: "paid", amount: checkoutTotal(40) });
    expect(await slotBooked(coach.slotIds[0])).toBe(true);

    expect((await coach.db.rpc("respond_booking", { booking_id: bookingId, accept: true })).error).toBeNull();
    // The session is tomorrow: the client can't mark it done yet, an admin can force it.
    expect((await client.db.rpc("complete_booking", { booking_id: bookingId })).error?.message).toContain("SESSION_NOT_STARTED");
    expect((await boss.db.rpc("complete_booking", { booking_id: bookingId })).error).toBeNull();

    const { data: earnings } = await coach.db.rpc("my_earnings");
    expect(earnings).toMatchObject({ total: splitPayout(40).coach, sessions: 1 });
  });

  it("no booking until the payment succeeds, and the slot is held meanwhile", async () => {
    const coach = await makeCoach();
    const first = await makeUser("client");
    const second = await makeUser("client");

    const { data: paymentId } = await first.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    const { count } = await admin.from("bookings").select("id", { count: "exact", head: true }).eq("slot_id", coach.slotIds[0]);
    expect(count).toBe(0);
    const held = await second.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    expect(held.error?.message).toContain("SLOT_UNAVAILABLE");

    expect((await confirm(paymentId!)).data).not.toBeNull();
  });

  it("a failed payment books nothing and frees the slot", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const other = await makeUser("client");
    const { data: paymentId } = await client.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });

    expect((await confirm(paymentId!, false)).data).toBeNull();
    const { data: payment } = await admin.from("payments").select("status, booking_id").eq("id", paymentId!).single();
    expect(payment).toEqual({ status: "failed", booking_id: null });
    expect((await other.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId })).error).toBeNull();
  });

  it("an expired hold frees the slot; paying late after someone else booked is refunded", async () => {
    const coach = await makeCoach();
    const slow = await makeUser("client");
    const fast = await makeUser("client");
    const { data: slowPayment } = await slow.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    await admin.from("payments").update({ expires_at: new Date(Date.now() - 60_000).toISOString() }).eq("id", slowPayment!);

    await payAndBook(fast.db, coach.slotIds[0], coach.offerId);
    expect((await confirm(slowPayment!)).data).toBeNull();
    const { data: payment } = await admin.from("payments").select("status").eq("id", slowPayment!).single();
    expect(payment?.status).toBe("refunded");
  });

  it("the gateway webhook is idempotent", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: paymentId } = await client.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    const first = await confirm(paymentId!);
    const again = await confirm(paymentId!);
    expect(again.data).toBe(first.data);
    expect((await confirm(paymentId!, false)).error?.message).toContain("INVALID_TRANSITION");
  });

  it("an offer is required when the coach has active offers", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { error } = await client.db.rpc("start_checkout", { slot_id: coach.slotIds[0] });
    expect(error?.message).toContain("OFFER_REQUIRED");
  });

  it("client cancels: payment refunded and the slot is free again", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const bookingId = await payAndBook(client.db, coach.slotIds[0], coach.offerId);
    expect((await client.db.rpc("cancel_booking", { booking_id: bookingId })).error).toBeNull();
    expect((await paymentOf(bookingId))?.status).toBe("refunded");
    expect(await slotBooked(coach.slotIds[0])).toBe(false);
  });

  it("coach declines: payment refunded, and it can't be answered twice", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const bookingId = await payAndBook(client.db, coach.slotIds[0], coach.offerId);
    expect((await coach.db.rpc("respond_booking", { booking_id: bookingId, accept: false })).error).toBeNull();
    expect((await paymentOf(bookingId))?.status).toBe("refunded");
    const again = await coach.db.rpc("respond_booking", { booking_id: bookingId, accept: true });
    expect(again.error?.message).toContain("INVALID_TRANSITION");
  });

  it("an unverified coach can't be booked", async () => {
    const coach = await makeCoach({ verified: false });
    const client = await makeUser("client");
    const { error } = await client.db.rpc("start_checkout", { slot_id: coach.slotIds[0], offer_id: coach.offerId });
    expect(error?.message).toContain("COACH_NOT_VERIFIED");
  });
});
