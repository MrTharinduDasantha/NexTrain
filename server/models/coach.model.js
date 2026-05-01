import mongoose from "mongoose";

const coachSchema = new mongoose.Schema(
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
    coachNumber: { type: String, required: true }, // e.g. "A1"
    rows: { type: Number, required: true, min: 1 },
    columns: { type: Number, required: true, min: 1 },
    /**
     * seatNumberingPattern - simple convention:
     *   "ROW_LETTER_COL" -> 1A, 1B... (default)
     *   "SEQ"            -> 1, 2, 3...
     */
    seatNumberingPattern: { type: String, default: "ROW_LETTER_COL" },
    /**
     * Aisle column index (0-based). The frontend uses this to draw a gap.
     * For a 2+2 layout, aisleAfterColumn = 1 (0-indexed).
     */
    aisleAfterColumn: { type: Number, default: 1 },
  },
  { timestamps: true },
);

coachSchema.index(
  { train: 1, trainClass: 1, coachNumber: 1 },
  { unique: true },
);

export default mongoose.model("Coach", coachSchema);
