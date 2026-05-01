import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    city: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export default mongoose.model("Station", stationSchema);
