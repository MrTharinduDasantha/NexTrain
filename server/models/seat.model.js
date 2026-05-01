import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coach",
      required: true,
    },
    seatNumber: { type: String, required: true }, // e.g. "1A"
    row: { type: Number, required: true },
    column: { type: Number, required: true },
    isBlocked: { type: Boolean, default: false }, // Admin-blocked (maintenance)
    blockReason: { type: String, default: "" },
  },
  { timestamps: true },
);

seatSchema.index({ coach: 1, seatNumber: 1 }, { unique: true });

export default mongoose.model("Seat", seatSchema);
