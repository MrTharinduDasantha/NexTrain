import mongoose from "mongoose";

/**
 * Passengers are embedded inside Booking for reads, but mirrored here so admin can
 * query the global passenger list (per train/date). Created on booking confirmation.
 */
const passengerSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
      index: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
      index: true,
    },
    journeyDate: { type: Date, required: true, index: true },
    name: { type: String, required: true },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    seatNumber: { type: String, required: true },
    coachNumber: { type: String, required: true },
    trainClass: { type: mongoose.Schema.Types.ObjectId, ref: "TrainClass" },
  },
  { timestamps: true },
);

export default mongoose.model("Passenger", passengerSchema);
