import Booking from "../models/booking.model.js";
import Seat from "../models/seat.model.js";
import Coach from "../models/coach.model.js";
import Fare from "../models/fare.model.js";
import Schedule from "../models/schedule.model.js";
import Route from "../models/route.model.js";
import SeatHold from "../models/seatHold.model.js";
import Passenger from "../models/passenger.model.js";
import Ticket from "../models/ticket.model.js";
import { ok, created, fail } from "../utils/response.util.js";
import { generatePNR } from "../utils/pnr.util.js";
import { emitSeatUpdate } from "../utils/socket.util.js";

const RESERVATION_CHARGE = Number(process.env.RESERVATION_CHARGE || 40);
const GST_PERCENT = Number(process.env.GST_PERCENT || 8);

export const initiateBooking = async (req, res) => {
  const {
    scheduleId,
    trainClassId,
    seatIds,
    fromStation,
    toStation,
    passengers,
  } = req.body;

  if (!Array.isArray(seatIds) || seatIds.length === 0)
    return fail(res, 400, "No seats selected");
  if (!Array.isArray(passengers) || passengers.length !== seatIds.length) {
    return fail(res, 400, "Must provide one passenger per selected seat");
  }

  // Verify holds
  const holds = await SeatHold.find({
    schedule: scheduleId,
    seat: { $in: seatIds },
    user: req.user._id,
    expiresAt: { $gt: new Date() },
  });
  if (holds.length !== seatIds.length)
    return fail(res, 409, "Some holds expired. Please reselect seats.");

  const schedule = await Schedule.findById(scheduleId).populate("train");
  const route = await Route.findOne({ train: schedule.train._id });
  const fareDoc = await Fare.findOne({
    train: schedule.train._id,
    trainClass: trainClassId,
  });
  if (!fareDoc)
    return fail(res, 400, "Fare not configured for this train/class");

  const fromStop = route.stops.find(
    (s) => String(s.station) === String(fromStation),
  );
  const toStop = route.stops.find(
    (s) => String(s.station) === String(toStation),
  );
  const distanceKm = Math.max(
    0,
    (toStop?.distanceKm || 0) - (fromStop?.distanceKm || 0),
  );

  const perSeatBase = fareDoc.baseFare + (fareDoc.perKmRate || 0) * distanceKm;
  const baseFare = perSeatBase * seatIds.length;
  const reservationCharge = RESERVATION_CHARGE * seatIds.length;
  const subtotal = baseFare + reservationCharge;
  const gst = +(subtotal * (GST_PERCENT / 100)).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  // Resolve coach numbers for each seat for the embedded snapshot
  const seats = await Seat.find({ _id: { $in: seatIds } }).populate("coach");
  const seatSnapshots = seats.map((s) => ({
    seat: s._id,
    seatNumber: s.seatNumber,
    coachNumber: s.coach.coachNumber,
  }));

  // Map passenger seatNumber back to coach
  const passengersWithCoach = passengers.map((p) => {
    const match = seatSnapshots.find((s) => s.seatNumber === p.seatNumber);
    return {
      ...p,
      seatNumber: p.seatNumber,
      coachNumber: match?.coachNumber || "",
    };
  });

  let pnr;
  for (let i = 0; i < 5; i++) {
    pnr = generatePNR();
    const exists = await Booking.findOne({ pnr });
    if (!exists) break;
  }

  const booking = await Booking.create({
    pnr,
    user: req.user._id,
    train: schedule.train._id,
    schedule: schedule._id,
    trainClass: trainClassId,
    fromStation,
    toStation,
    journeyDate: schedule.date,
    seats: seatSnapshots,
    passengers: passengersWithCoach.map((p) => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      seatNumber: p.seatNumber,
    })),
    fare: { baseFare, reservationCharge, gst, total },
    status: "pending_payment",
  });

  return created(res, { booking }, "Booking initiated. Proceed to payment.");
};

export const confirmBookingInternal = async (bookingId, paymentDoc) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "confirmed") return booking;

  booking.status = "confirmed";
  booking.payment = paymentDoc?._id;
  await booking.save();

  // Release holds for these seats
  await SeatHold.deleteMany({
    schedule: booking.schedule,
    seat: { $in: booking.seats.map((s) => s.seat) },
    user: booking.user,
  });

  // Mirror passengers
  const passengerDocs = booking.passengers.map((p) => {
    const seatRef = booking.seats.find((s) => s.seatNumber === p.seatNumber);
    return {
      booking: booking._id,
      train: booking.train,
      schedule: booking.schedule,
      journeyDate: booking.journeyDate,
      trainClass: booking.trainClass,
      name: p.name,
      age: p.age,
      gender: p.gender,
      seatNumber: p.seatNumber,
      coachNumber: seatRef?.coachNumber || "",
    };
  });
  await Passenger.insertMany(passengerDocs);

  // Create ticket record
  await Ticket.findOneAndUpdate(
    { booking: booking._id },
    { booking: booking._id, pnr: booking.pnr, issuedAt: new Date() },
    { upsert: true, new: true },
  );

  // Emit seat updates
  booking.seats.forEach((s) =>
    emitSeatUpdate({
      scheduleId: booking.schedule,
      classId: booking.trainClass,
      seatId: s.seat,
      status: "booked",
    }),
  );

  return booking;
};

export const myBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("train fromStation toStation trainClass")
    .sort({ createdAt: -1 });

  return ok(res, { bookings });
};

export const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(
    "train fromStation toStation trainClass user",
  );
  if (!booking) return fail(res, 404, "Booking not found");

  if (
    String(booking.user._id) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return fail(res, 403, "Not allowed");
  }

  return ok(res, { booking });
};

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return fail(res, 404, "Booking not found");
  if (
    String(booking.user) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return fail(res, 403, "Not allowed");
  }

  booking.status = "cancelled";
  await booking.save();
  // Free seats
  booking.seats.forEach((s) =>
    emitSeatUpdate({
      scheduleId: booking.schedule,
      classId: booking.trainClass,
      seatId: s.seat,
      status: "available",
    }),
  );

  return ok(res, { booking }, "Booking cancelled");
};

/* Admin */
export const adminListBookings = async (req, res) => {
  const filter = {};
  if (req.query.pnr) filter.pnr = req.query.pnr.toUpperCase();
  if (req.query.train) filter.train = req.query.train;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from && req.query.to) {
    filter.journeyDate = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }

  const bookings = await Booking.find(filter)
    .populate("user train fromStation toStation trainClass")
    .sort({ createdAt: -1 })
    .limit(500);

  return ok(res, { bookings });
};
