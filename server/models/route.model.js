import mongoose from "mongoose";

const stopSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    sequence: { type: Number, required: true },
    arrival: { type: String }, // "HH:mm" relative
    departure: { type: String },
    distanceKm: { type: Number, default: 0 },
  },
  { _id: false },
);

const routeSchema = new mongoose.Schema(
  {
    train: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Train",
      required: true,
      unique: true,
    },
    stops: {
      type: [stopSchema],
      validate: (v) => Array.isArray(v) && v.length >= 2,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Route", routeSchema);
