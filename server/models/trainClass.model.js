import mongoose from "mongoose";

export const CLASS_CODES = [
  "FCO", // First Class Observation Saloon
  "FAC", // First Class Air-Conditioned
  "SCR", // Second Class Reserved
  "SCU", // Second Class Unreserved
  "TCR", // Third Class Reserved
  "TCU", // Third Class Unreserved
];

const trainClassSchema = new mongoose.Schema(
  {
    code: { type: String, enum: CLASS_CODES, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    isReserved: { type: Boolean, default: true }, // Unreserved classes have no seat map
  },
  { timestamps: true },
);

export default mongoose.model("TrainClass", trainClassSchema);
