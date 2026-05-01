import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import { getStripe } from "../configs/stripe.config.js";
import { ok, fail } from "../utils/response.util.js";

export const createCheckoutSession = async (req, res) => {
  const { bookingId } = req.body;

  const booking =
    await Booking.findById(bookingId).populate("train trainClass");
  if (!booking) return fail(res, 404, "Booking not found");
  if (String(booking.user) !== String(req.user._id))
    return fail(res, 403, "Not allowed");
  if (booking.status !== "pending_payment")
    return fail(res, 400, "Booking is not awaiting payment");

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.user.email,
    metadata: { bookingId: String(booking._id), pnr: booking.pnr },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "lkr",
          unit_amount: Math.round(booking.fare.total * 100),
          product_data: {
            name: `NexTrain — ${booking.train.name} (${booking.trainClass.name})`,
            description: `PNR ${booking.pnr} • ${booking.seats.length} seat(s)`,
          },
        },
      },
    ],
    success_url: `${process.env.STRIPE_SUCCESS_URL}?bookingId=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.STRIPE_CANCEL_URL}?bookingId=${booking._id}`,
  });

  booking.stripeSessionId = session.id;
  await booking.save();

  await Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      booking: booking._id,
      user: booking.user,
      amount: booking.fare.total,
      currency: "lkr",
      provider: "stripe",
      stripeSessionId: session.id,
      status: "pending",
    },
    { upsert: true, new: true },
  );

  return ok(res, { url: session.url, sessionId: session.id });
};

// Verifies the session is paid then confirms the booking.
export const verifyAndConfirm = async (req, res) => {
  const { sessionId } = req.body;
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return fail(res, 402, "Payment not completed");
  }

  const bookingId = session.metadata?.bookingId;
  const booking = await Booking.findById(bookingId);
  if (!booking) return fail(res, 404, "Booking not found");
  if (String(booking.user) !== String(req.user._id))
    return fail(res, 403, "Not allowed");

  const payment = await Payment.findOneAndUpdate(
    { booking: booking._id },
    {
      stripePaymentIntentId: session.payment_intent,
      status: "succeeded",
    },
    { new: true },
  );

  // Lazy import to avoid circular deps
  const { confirmBookingInternal } = await import("./booking.controller.js");
  const confirmed = await confirmBookingInternal(booking._id, payment);

  // Send confirmation email + attach PDF
  try {
    const { sendEmail, bookingConfirmationEmail } =
      await import("../utils/email.util.js");
    const { generateETicketPDF } = await import("../utils/pdf.util.js");
    const populated = await Booking.findById(confirmed._id).populate(
      "user train fromStation toStation trainClass",
    );
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
    console.warn("Email/PDF post-confirm failed:", e.message);
  }

  return ok(res, { booking: confirmed }, "Payment verified, booking confirmed");
};
