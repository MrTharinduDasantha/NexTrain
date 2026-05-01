import Booking from "../models/booking.model.js";
import { generateETicketPDF } from "../utils/pdf.util.js";
import { ok, fail } from "../utils/response.util.js";

export const getTicket = async (req, res) => {
  const booking = await Booking.findOne({
    pnr: req.params.pnr.toUpperCase(),
  }).populate("train fromStation toStation trainClass user");

  if (!booking) return fail(res, 404, "Ticket not found");
  if (
    String(booking.user._id) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return fail(res, 403, "Not allowed");
  }
  if (booking.status !== "confirmed")
    return fail(res, 400, "Ticket not yet confirmed");

  return ok(res, { booking });
};

export const downloadTicket = async (req, res) => {
  const booking = await Booking.findOne({
    pnr: req.params.pnr.toUpperCase(),
  }).populate("train fromStation toStation trainClass user");

  if (!booking) return fail(res, 404, "Ticket not found");
  if (
    String(booking.user._id) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return fail(res, 403, "Not allowed");
  }
  if (booking.status !== "confirmed")
    return fail(res, 400, "Ticket not yet confirmed");

  const buf = await generateETicketPDF(booking);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="NexTrain-${booking.pnr}.pdf"`,
  );

  return res.send(buf);
};
