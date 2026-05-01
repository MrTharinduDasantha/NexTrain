import Coach from "../models/coach.model.js";
import Seat from "../models/seat.model.js";
import Booking from "../models/booking.model.js";
import SeatHold from "../models/seatHold.model.js";
import Schedule from "../models/schedule.model.js";
import { ok, created, fail } from "../utils/response.util.js";
import { emitSeatUpdate } from "../utils/socket.util.js";

const HOLD_SECONDS = Number(process.env.SEAT_HOLD_SECONDS || 600);
const MAX_PER_BOOKING = 6;

export const getSeatMap = async (req, res) => {
  const { scheduleId, trainClassId } = req.query;
  if (!scheduleId || !trainClassId)
    return fail(res, 400, "scheduleId and trainClassId required");

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) return fail(res, 404, "Schedule not found");

  const coaches = await Coach.find({
    train: schedule.train,
    trainClass: trainClassId,
  });
  const coachIds = coaches.map((c) => c._id);
  const seats = await Seat.find({ coach: { $in: coachIds } });

  // booked seats
  const bookings = await Booking.find({
    schedule: scheduleId,
    trainClass: trainClassId,
    status: "confirmed",
  }).select("seats");
  const bookedSet = new Set();
  bookings.forEach((b) =>
    b.seats.forEach((s) => bookedSet.add(String(s.seat))),
  );

  // active holds (not by current user)
  const holds = await SeatHold.find({
    schedule: scheduleId,
    seat: { $in: seats.map((s) => s._id) },
    expiresAt: { $gt: new Date() },
  }).select("seat user");
  const heldByOthers = new Set();
  const heldByMe = new Set();
  holds.forEach((h) => {
    if (req.user && String(h.user) === String(req.user._id))
      heldByMe.add(String(h.seat));
    else heldByOthers.add(String(h.seat));
  });

  const seatMap = coaches.map((c) => ({
    coach: c,
    seats: seats
      .filter((s) => String(s.coach) === String(c._id))
      .map((s) => {
        let status = "available";
        if (s.isBlocked) status = "blocked";
        else if (bookedSet.has(String(s._id))) status = "booked";
        else if (heldByOthers.has(String(s._id))) status = "held";
        else if (heldByMe.has(String(s._id))) status = "selected";
        return {
          _id: s._id,
          seatNumber: s.seatNumber,
          row: s.row,
          column: s.column,
          status,
        };
      })
      .sort((a, b) => a.row - b.row || a.column - b.column),
  }));

  return ok(res, { seatMap, holdSeconds: HOLD_SECONDS });
};

export const holdSeats = async (req, res) => {
  const { scheduleId, trainClassId, seatIds, fromStation, toStation } =
    req.body;
  if (!Array.isArray(seatIds) || seatIds.length === 0)
    return fail(res, 400, "No seats selected");
  if (seatIds.length > MAX_PER_BOOKING)
    return fail(res, 400, `Max ${MAX_PER_BOOKING} seats per booking`);

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) return fail(res, 404, "Schedule not found");

  // Reject if any of these seats are already held by another user or booked
  const conflictHolds = await SeatHold.find({
    schedule: scheduleId,
    seat: { $in: seatIds },
    user: { $ne: req.user._id },
    expiresAt: { $gt: new Date() },
  });
  if (conflictHolds.length)
    return fail(
      res,
      409,
      "One or more seats are currently held by another user",
    );

  const conflictBookings = await Booking.find({
    schedule: scheduleId,
    "seats.seat": { $in: seatIds },
    status: "confirmed",
  });
  if (conflictBookings.length)
    return fail(res, 409, "One or more seats are already booked");

  // Refresh / create holds
  const expiresAt = new Date(Date.now() + HOLD_SECONDS * 1000);
  const holds = [];
  for (const seatId of seatIds) {
    const hold = await SeatHold.findOneAndUpdate(
      { seat: seatId, schedule: scheduleId },
      {
        seat: seatId,
        schedule: scheduleId,
        user: req.user._id,
        fromStation,
        toStation,
        expiresAt,
      },
      { upsert: true, new: true },
    );
    holds.push(hold);
    emitSeatUpdate({
      scheduleId,
      classId: trainClassId,
      seatId,
      status: "held",
    });
  }

  return created(res, { holds, expiresAt }, "Seats held");
};

export const releaseSeats = async (req, res) => {
  const { scheduleId, seatIds, trainClassId } = req.body;

  await SeatHold.deleteMany({
    schedule: scheduleId,
    seat: { $in: seatIds },
    user: req.user._id,
  });

  if (trainClassId) {
    seatIds.forEach((seatId) =>
      emitSeatUpdate({
        scheduleId,
        classId: trainClassId,
        seatId,
        status: "available",
      }),
    );
  }

  return ok(res, null, "Seats released");
};
