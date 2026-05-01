import { getStripe } from "../configs/stripe.config.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import SeatHold from "../models/seatHold.model.js";

/**
 * Express handler for /api/stripe/webhook.
 * Body must be RAW (set up in server.js using express.raw({ type: "application/json" })).
 */
export const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        const payment = await Payment.findOneAndUpdate(
          { booking: bookingId },
          {
            stripePaymentIntentId: session.payment_intent,
            status: "succeeded",
            raw: { id: session.id, status: session.payment_status },
          },
          { new: true, upsert: true },
        );
        const { confirmBookingInternal } =
          await import("./booking.controller.js");
        const booking = await confirmBookingInternal(bookingId, payment);

        // Email + PDF
        try {
          const populated = await Booking.findById(booking._id).populate(
            "user train fromStation toStation trainClass",
          );
          const { sendEmail, bookingConfirmationEmail } =
            await import("../utils/email.util.js");
          const { generateETicketPDF } = await import("../utils/pdf.util.js");
          const pdf = await generateETicketPDF(populated);
          const tpl = bookingConfirmationEmail({
            name: populated.user.name,
            pnr: populated.pnr,
            train: `${populated.train.number} ${populated.train.name}`,
            journeyDate: new Date(populated.journeyDate).toDateString(),
            total: populated.fare.total,
            seats: populated.seats,
          });

          sendEmail({
            to: populated.user.email,
            subject: tpl.subject,
            html: tpl.html,
            attachments: [
              { filename: `NexTrain-${populated.pnr}.pdf`, content: pdf },
            ],
          });
        } catch (e) {
          console.warn("Email/PDF webhook post failed:", e.message);
        }
      }
    } else if (
      event.type === "checkout.session.expired" ||
      event.type === "payment_intent.payment_failed"
    ) {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        const booking = await Booking.findById(bookingId);
        if (booking && booking.status === "pending_payment") {
          booking.status = "failed";
          await booking.save();
          await SeatHold.deleteMany({
            schedule: booking.schedule,
            user: booking.user,
          });
        }
        await Payment.findOneAndUpdate(
          { booking: bookingId },
          { status: "failed", raw: event.data.object },
        );
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};
