import mongoose from "mongoose";

const seatHoldSchema = new mongoose.Schema(
  {
    seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// One active hold per seat+schedule
seatHoldSchema.index({ seat: 1, schedule: 1 }, { unique: true });
// TTL — Mongo will purge expired docs automatically
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SeatHold", seatHoldSchema);
