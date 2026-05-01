import mongoose from "mongoose";

const trainSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    daysOfOperation: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Train", trainSchema);
