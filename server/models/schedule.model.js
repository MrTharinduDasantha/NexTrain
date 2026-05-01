import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    date: { type: Date, required: true }, // Journey date (start)
    status: {
      type: String,
      enum: ["scheduled", "running", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

scheduleSchema.index({ train: 1, date: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
