import Booking from "../models/booking.model.js";
import PDFDocument from "pdfkit";
import { ok } from "../utils/response.util.js";

const dateRange = (req) => {
  const from = req.query.from
    ? new Date(req.query.from)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = req.query.to ? new Date(req.query.to) : new Date();

  return { from, to };
};

export const revenueReport = async (req, res) => {
  const { from, to } = dateRange(req);

  const data = await Booking.aggregate([
    { $match: { status: "confirmed", createdAt: { $gte: from, $lte: to } } },
    {
      $lookup: {
        from: "trains",
        localField: "train",
        foreignField: "_id",
        as: "train",
      },
    },
    { $unwind: "$train" },
    {
      $group: {
        _id: { trainId: "$train._id", trainName: "$train.name" },
        revenue: { $sum: "$fare.total" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  return ok(res, { from, to, report: data });
};

export const occupancyReport = async (req, res) => {
  const { from, to } = dateRange(req);
  const data = await Booking.aggregate([
    { $match: { status: "confirmed", journeyDate: { $gte: from, $lte: to } } },
    {
      $lookup: {
        from: "trains",
        localField: "train",
        foreignField: "_id",
        as: "train",
      },
    },
    { $unwind: "$train" },
    {
      $group: {
        _id: { trainId: "$train._id", trainName: "$train.name" },
        seatsBooked: { $sum: { $size: "$seats" } },
      },
    },
    { $sort: { seatsBooked: -1 } },
  ]);

  return ok(res, { from, to, report: data });
};

export const exportRevenuePDF = async (req, res) => {
  const { from, to } = dateRange(req);

  const data = await Booking.aggregate([
    { $match: { status: "confirmed", createdAt: { $gte: from, $lte: to } } },
    {
      $lookup: {
        from: "trains",
        localField: "train",
        foreignField: "_id",
        as: "train",
      },
    },
    { $unwind: "$train" },
    {
      $group: {
        _id: "$train.name",
        revenue: { $sum: "$fare.total" },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="NexTrain-Revenue-Report.pdf"`,
  );
  doc.pipe(res);

  doc.fontSize(18).text("NexTrain — Revenue Report", { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`${from.toDateString()} → ${to.toDateString()}`, { align: "center" });
  doc.moveDown();
  doc.fillColor("#000").fontSize(11);
  doc.text("Train".padEnd(40) + "Bookings".padEnd(15) + "Revenue (LKR)");
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  let total = 0;
  data.forEach((row) => {
    doc.text(
      `${(row._id || "—").padEnd(40)}${String(row.bookings).padEnd(15)}${row.revenue.toFixed(2)}`,
    );
    total += row.revenue;
  });
  doc.moveDown();
  doc
    .fontSize(13)
    .fillColor("#0a7")
    .text(`Total: LKR ${total.toFixed(2)}`);
  doc.end();
};
