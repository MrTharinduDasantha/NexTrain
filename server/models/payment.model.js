import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "lkr" },
    provider: { type: String, default: "stripe" },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String, index: true },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    raw: { type: mongoose.Schema.Types.Mixed }, // Last webhook payload (sanitised)
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
