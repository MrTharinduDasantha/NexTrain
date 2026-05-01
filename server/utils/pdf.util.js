import PDFDocument from "pdfkit";

/**
 * Returns a Buffer containing the e-ticket PDF.
 * Called from booking confirmation flow.
 */
export const generateETicketPDF = (booking) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Header
      doc
        .fillColor("#0a7")
        .fontSize(24)
        .text("NexTrain — E-Ticket", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fillColor("#333")
        .fontSize(10)
        .text("Sri Lanka Railways  •  Confirmation", { align: "center" });
      doc.moveDown();

      doc
        .strokeColor("#0a7")
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .stroke();
      doc.moveDown();

      // PNR
      doc
        .fillColor("#000")
        .fontSize(14)
        .text(`PNR: ${booking.pnr}`, { continued: false });
      doc
        .fontSize(10)
        .fillColor("#666")
        .text(`Issued: ${new Date().toLocaleString()}`);
      doc.moveDown();

      // Journey
      doc
        .fillColor("#000")
        .fontSize(12)
        .text(`Train: ${booking.train?.number} ${booking.train?.name || ""}`);
      doc.text(`Class: ${booking.trainClass?.name || ""}`);
      doc.text(
        `From: ${booking.fromStation?.name || ""}  →  To: ${booking.toStation?.name || ""}`,
      );
      doc.text(`Journey Date: ${new Date(booking.journeyDate).toDateString()}`);
      doc.moveDown();

      // Passengers table
      doc.fontSize(13).fillColor("#0a7").text("Passengers");
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#000");
      doc.text(
        "Name                                Age   Gender   Coach   Seat",
      );
      doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
      booking.passengers.forEach((p) => {
        doc.text(
          `${(p.name || "").padEnd(34)} ${String(p.age || "").padEnd(5)} ${(p.gender || "").padEnd(8)} ${
            booking.seats.find((s) => s.seatNumber === p.seatNumber)
              ?.coachNumber || ""
          }      ${p.seatNumber}`,
        );
      });
      doc.moveDown();

      // Fare
      doc.fontSize(13).fillColor("#0a7").text("Fare");
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#000");
      doc.text(`Base Fare: LKR ${booking.fare.baseFare.toFixed(2)}`);
      doc.text(
        `Reservation Charge: LKR ${booking.fare.reservationCharge.toFixed(2)}`,
      );
      doc.text(`GST: LKR ${booking.fare.gst.toFixed(2)}`);
      doc
        .fontSize(12)
        .fillColor("#0a7")
        .text(`Total Paid: LKR ${booking.fare.total.toFixed(2)}`);
      doc.moveDown();

      doc
        .fontSize(8)
        .fillColor("#999")
        .text(
          "This is a computer-generated e-ticket. Please carry a valid photo ID at the time of travel.",
          { align: "center" },
        );

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
