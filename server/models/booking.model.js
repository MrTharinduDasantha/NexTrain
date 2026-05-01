import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    pnr: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    trainClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainClass",
      required: true,
    },
    fromStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    toStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    journeyDate: { type: Date, required: true },

    seats: [
      {
        seat: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seat",
          required: true,
        },
        seatNumber: { type: String, required: true },
        coachNumber: { type: String, required: true },
      },
    ],

    passengers: [
      {
        name: String,
        age: Number,
        gender: { type: String, enum: ["male", "female", "other"] },
        seatNumber: String,
      },
    ],

    fare: {
      baseFare: { type: Number, required: true },
      reservationCharge: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "failed"],
      default: "pending_payment",
    },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    stripeSessionId: { type: String, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
