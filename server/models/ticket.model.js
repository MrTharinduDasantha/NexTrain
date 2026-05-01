import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    pnr: { type: String, required: true, index: true },
    issuedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: "" }, // Optional cloud-hosted PDF
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);
