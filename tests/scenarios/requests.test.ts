import { afterAll, describe, expect, it } from "vitest";
import { checkoutTotal } from "@/lib/money";
import { admin, cleanup, confirm, enabled, makeCoach, makeUser, postRequest as request } from "./helpers";

describe.skipIf(!enabled)("scenario: requests and proposals", () => {
  afterAll(cleanup);

  it("client posts → coach proposes → client pays: booking confirmed, request fulfilled, rival rejected", async () => {
    const coach = await makeCoach();
    const rival = await makeCoach();
    const client = await makeUser("client");

    const { data: requestId, error } = await request(client.db);
    expect(error).toBeNull();
    const { data: proposalId } = await coach.db.rpc("create_proposal", { request_id: requestId!, slot_id: coach.slotIds[0], price: 45, message: "Avec plaisir !" });
    const { data: rivalId } = await rival.db.rpc("create_proposal", { request_id: requestId!, slot_id: rival.slotIds[0], price: 50, message: "Disponible samedi." });

    const { data: paymentId, error: checkoutError } = await client.db.rpc("start_proposal_checkout", { proposal_id: proposalId! });
    expect(checkoutError).toBeNull();
    const { data: bookingId } = await confirm(paymentId!);

    const { data: booking } = await admin.from("bookings").select("status, price").eq("id", bookingId!).single();
    expect(booking).toEqual({ status: "confirmed", price: 45 });
    const { data: payment } = await admin.from("payments").select("status, amount").eq("id", paymentId!).single();
    expect(payment).toEqual({ status: "paid", amount: checkoutTotal(45) });
    const { data: req } = await admin.from("requests").select("status").eq("id", requestId!).single();
    expect(req?.status).toBe("fulfilled");
    const { data: other } = await admin.from("proposals").select("status").eq("id", rivalId!).single();
    expect(other?.status).toBe("rejected");
  });

  it("phone numbers and e-mails are refused in requests and proposals", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    expect((await request(client.db, { description: "Appelez-moi au 22 123 456" })).error?.message).toContain("CONTACT_INFO");

    const { data: requestId } = await request(client.db);
    const { error } = await coach.db.rpc("create_proposal", { request_id: requestId!, slot_id: coach.slotIds[0], price: 40, message: "Écrivez-moi : coach@gmail.com" });
    expect(error?.message).toContain("CONTACT_INFO");
  });

  it("a client can have at most 3 open requests", async () => {
    const client = await makeUser("client");
    for (let i = 0; i < 3; i++) expect((await request(client.db)).error).toBeNull();
    expect((await request(client.db)).error?.message).toContain("MAX_OPEN_REQUESTS");
  });

  it("a coach can't propose twice, nor on another sport", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: requestId } = await request(client.db);
    const propose = (slot: string) => coach.db.rpc("create_proposal", { request_id: requestId!, slot_id: slot, price: 40, message: "" });
    expect((await propose(coach.slotIds[0])).error).toBeNull();
    expect((await propose(coach.slotIds[1])).error?.message).toContain("ALREADY_PROPOSED");

    const { data: tennis } = await request(client.db, { title: "Tennis" });
    await admin.from("requests").update({ sport: "Tennis" }).eq("id", tennis!);
    const { error } = await coach.db.rpc("create_proposal", { request_id: tennis!, slot_id: coach.slotIds[2], price: 40, message: "" });
    expect(error?.message).toContain("SPORT_MISMATCH");
  });

  it("closed requests take no more proposals", async () => {
    const coach = await makeCoach();
    const client = await makeUser("client");
    const { data: requestId } = await request(client.db);
    expect((await client.db.rpc("close_request", { request_id: requestId! })).error).toBeNull();
    const { error } = await coach.db.rpc("create_proposal", { request_id: requestId!, slot_id: coach.slotIds[0], price: 40, message: "" });
    expect(error?.message).toContain("REQUEST_CLOSED");
  });
});
