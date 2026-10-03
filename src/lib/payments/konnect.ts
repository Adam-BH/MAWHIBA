import "server-only";

/**
 * Konnect payment gateway. Only the mock exists for now: it sends the client to our own /pay/<id> page,
 * which plays the gateway and confirms through the same RPC a webhook would (`confirm_payment`).
 * ponytail: mock only. Real Konnect = POST /api/v2/payments/init-payment (amount in millimes, orderId = payment id,
 * webhook = /api/payments/konnect) returning payUrl, then the webhook checks GET /payments/:ref and calls confirm_payment.
 */
export const isMockGateway = !process.env.KONNECT_API_KEY;

export function initPayment(paymentId: string): { payUrl: string } {
  if (!isMockGateway) throw new Error("Konnect API not wired yet: unset KONNECT_API_KEY to use the mock gateway");
  return { payUrl: `/pay/${paymentId}` };
}
