import api, { unwrap } from "./axios.js";

export const paymentApi = {
  /**
   * Create a Stripe Checkout Session for a pending booking.
   * Returns { url, sessionId } — the caller should redirect to `url`.
   */
  createCheckoutSession: (bookingId) =>
    unwrap(api.post("/payments/checkout-session", { bookingId })),

  /**
   * Fallback verification (used on the success page when Stripe webhooks
   * aren't configured for the dev environment).
   */
  verify: (sessionId) => unwrap(api.post("/payments/verify", { sessionId })),
};
