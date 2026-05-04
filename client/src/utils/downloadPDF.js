import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "./formatDate.js";

/**
 * Save a Blob to disk with a given filename.
 * Used for server-streamed PDFs (ticketApi.downloadServerPDF, reportApi.revenuePDF).
 */
export const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

/**
 * Generate an e-ticket PDF on the client using jsPDF.
 * Useful as an offline fallback or for instant downloads from the booking dashboard.
 *
 * `booking` should be a populated booking object as returned by /api/tickets/:pnr.
 */
export const generateETicketPDF = (booking) => {
  if (!booking) throw new Error("booking is required");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  /* --- Header --- */
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, pageWidth, 90, "F");
  doc.setTextColor(52, 211, 153);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("NexTrain", margin, 45);

  doc.setTextColor(148, 163, 184);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Sri Lanka Railways · E-Ticket", margin, 65);

  // Right-aligned PNR badge
  doc.setTextColor(241, 245, 249);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const pnrLabel = `PNR: ${booking.pnr}`;
  doc.text(pnrLabel, pageWidth - margin, 45, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Issued ${new Date().toLocaleDateString()}`,
    pageWidth - margin,
    62,
    {
      align: "right",
    },
  );

  /* --- Journey block --- */
  let y = 130;
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `${booking.train?.number || ""}  ${booking.train?.name || ""}`.trim(),
    margin,
    y,
  );

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${booking.fromStation?.name || ""}  →  ${booking.toStation?.name || ""}`,
    margin,
    y,
  );

  y += 16;
  doc.text(
    `Class: ${booking.trainClass?.name || ""}    ·    Date: ${formatDate(
      booking.journeyDate,
    )}`,
    margin,
    y,
  );

  /* --- Passengers table --- */
  y += 24;
  autoTable(doc, {
    startY: y,
    head: [["#", "Passenger", "Age", "Gender", "Coach", "Seat"]],
    body: (booking.passengers || []).map((p, i) => {
      const seatRef = (booking.seats || []).find(
        (s) => s.seatNumber === p.seatNumber,
      );
      return [
        i + 1,
        p.name || "",
        p.age ?? "",
        p.gender || "",
        seatRef?.coachNumber || "",
        p.seatNumber || "",
      ];
    }),
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [2, 17, 11],
      fontStyle: "bold",
    },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: margin, right: margin },
  });

  /* --- Fare summary --- */
  let fy = doc.lastAutoTable.finalY + 24;
  const fare = booking.fare || {};

  const right = (text, yy) =>
    doc.text(text, pageWidth - margin, yy, { align: "right" });
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);

  doc.text("Base fare", margin, fy);
  right(`LKR ${(fare.baseFare ?? 0).toFixed(2)}`, fy);
  fy += 16;
  doc.text("Reservation charge", margin, fy);
  right(`LKR ${(fare.reservationCharge ?? 0).toFixed(2)}`, fy);
  fy += 16;
  doc.text("GST", margin, fy);
  right(`LKR ${(fare.gst ?? 0).toFixed(2)}`, fy);

  fy += 12;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, fy, pageWidth - margin, fy);

  fy += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(16, 185, 129);
  doc.text("Total paid", margin, fy);
  right(`LKR ${(fare.total ?? 0).toFixed(2)}`, fy);

  /* --- Footer --- */
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Carry a valid photo ID alongside this e-ticket. Have a safe journey aboard NexTrain.",
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 30,
    { align: "center" },
  );

  doc.save(`NexTrain-${booking.pnr}.pdf`);
};
