import type { Enums } from "@/lib/supabase/database.types";

export type RequestStatus = Enums<"request_status">;
export type ProposalStatus = Enums<"proposal_status">;

export function isOutOfBudget(price: number, budgetMin: number, budgetMax: number) {
  return price < budgetMin || price > budgetMax;
}

/** Open requests past `expires_at` are expired (no cron: computed on read). */
export function effectiveRequestStatus(status: RequestStatus, expiresAt: Date, now = new Date()): RequestStatus {
  return status === "open" && expiresAt <= now ? "expired" : status;
}

/** Mirror of the accept_proposal guards (the RPC re-checks slot + balance). */
export function canAcceptProposal(proposal: ProposalStatus, request: RequestStatus, expiresAt: Date, now = new Date()) {
  return proposal === "pending" && effectiveRequestStatus(request, expiresAt, now) === "open";
}

/** Price a coach is suggested: their matching offer price, capped at the client's budget max. */
export function suggestedProposalPrice(offerPrice: number | null, budgetMax: number) {
  return offerPrice === null ? budgetMax : Math.min(offerPrice, budgetMax);
}
