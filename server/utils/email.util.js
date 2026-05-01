import nodemailer from "nodemailer";

let _transporter;

const getTransporter = () => {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });

  return _transporter;
};

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || "NexTrain <no-reply@nextrain.lk>",
      to,
      subject,
      text,
      html,
      attachments,
    });

    return info;
  } catch (err) {
    console.error("✉️  Email send failed:", err.message);

    // Don't throw — booking flow should not fail because of email issues
    return null;
  }
};

export const bookingConfirmationEmail = ({
  name,
  pnr,
  train,
  journeyDate,
  total,
  seats,
}) => {
  const seatList = seats
    .map((s) => `${s.coachNumber}/${s.seatNumber}`)
    .join(", ");

  return {
    subject: `🎫 NexTrain booking confirmed — PNR ${pnr}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#0a7;">Booking Confirmed</h2>
        <p>Hi ${name},</p>
        <p>Your NexTrain ticket has been confirmed. Your e-ticket is attached.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <tr><td><b>PNR</b></td><td>${pnr}</td></tr>
          <tr><td><b>Train</b></td><td>${train}</td></tr>
          <tr><td><b>Journey Date</b></td><td>${journeyDate}</td></tr>
          <tr><td><b>Seats</b></td><td>${seatList}</td></tr>
          <tr><td><b>Total Paid</b></td><td>LKR ${total.toFixed(2)}</td></tr>
        </table>
        <p style="margin-top:24px;color:#666;">Thank you for choosing NexTrain. Have a safe journey!</p>
      </div>
    `,
  };
};
