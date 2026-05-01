import mongoose from "mongoose";

const fareSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    trainClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrainClass",
      required: true,
    },
    baseFare: { type: Number, required: true, min: 0 },
    perKmRate: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

fareSchema.index({ train: 1, trainClass: 1 }, { unique: true });

export default mongoose.model("Fare", fareSchema);
