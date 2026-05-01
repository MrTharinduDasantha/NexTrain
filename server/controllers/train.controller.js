import Train from "../models/train.model.js";
import Route from "../models/route.model.js";
import Schedule from "../models/schedule.model.js";
import Fare from "../models/fare.model.js";
import Coach from "../models/coach.model.js";
import Seat from "../models/seat.model.js";
import Booking from "../models/booking.model.js";
import SeatHold from "../models/seatHold.model.js";
import { ok, created, fail } from "../utils/response.util.js";

export const listTrains = async (_req, res) => {
  const trains = await Train.find().sort({ number: 1 });

  return ok(res, { trains });
};

export const getTrain = async (req, res) => {
  const train = await Train.findById(req.params.id);
  if (!train) return fail(res, 404, "Train not found");

  const route = await Route.findOne({ train: train._id }).populate(
    "stops.station",
  );

  return ok(res, { train, route });
};

export const createTrain = async (req, res) => {
  const train = await Train.create(req.body);

  return created(res, { train }, "Train created");
};

export const updateTrain = async (req, res) => {
  const train = await Train.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!train) return fail(res, 404, "Train not found");

  return ok(res, { train }, "Train updated");
};

export const deleteTrain = async (req, res) => {
  const train = await Train.findByIdAndDelete(req.params.id);
  if (!train) return fail(res, 404, "Train not found");

  return ok(res, null, "Train deleted");
};

const dayKey = (date) =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(date).getDay()];

/**
 * Public train search.
 *  GET /api/trains/search?from=<stationId>&to=<stationId>&date=<ISODate>
 *
 * Returns trains where the route contains "from" before "to", on a day the train operates.
 * For each train: classes, fare, available seat counts.
 */
export const searchTrains = async (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to || !date)
    return fail(res, 400, "from, to and date are required");

  const journeyDate = new Date(date);
  if (isNaN(journeyDate.getTime())) return fail(res, 400, "Invalid date");

  const operatingDay = dayKey(journeyDate);

  // Find routes containing both stops in correct order
  const routes = await Route.find({
    "stops.station": { $all: [from, to] },
  }).populate("train stops.station");

  const matching = [];
  for (const route of routes) {
    if (!route.train?.isActive) continue;
    if (!route.train.daysOfOperation?.includes(operatingDay)) continue;

    const fromStop = route.stops.find(
      (s) => String(s.station._id) === String(from),
    );
    const toStop = route.stops.find(
      (s) => String(s.station._id) === String(to),
    );
    if (!fromStop || !toStop) continue;
    if (fromStop.sequence >= toStop.sequence) continue;

    // Find/create schedule for this date
    const dayStart = new Date(journeyDate);
    dayStart.setHours(0, 0, 0, 0);
    let schedule = await Schedule.findOne({
      train: route.train._id,
      date: dayStart,
    });
    if (!schedule) {
      schedule = await Schedule.create({
        train: route.train._id,
        date: dayStart,
      });
    }

    // Fares
    const fares = await Fare.find({ train: route.train._id }).populate(
      "trainClass",
    );

    // Compute distance between stops
    const distanceKm = Math.max(
      0,
      (toStop.distanceKm || 0) - (fromStop.distanceKm || 0),
    );

    const classes = await Promise.all(
      fares.map(async (f) => {
        const fare = f.baseFare + (f.perKmRate || 0) * distanceKm;
        let available = null;
        if (f.trainClass.isReserved) {
          const coaches = await Coach.find({
            train: route.train._id,
            trainClass: f.trainClass._id,
          });
          const seatTotal = await Seat.countDocuments({
            coach: { $in: coaches.map((c) => c._id) },
            isBlocked: false,
          });
          const bookedCount = await Booking.aggregate([
            {
              $match: {
                schedule: schedule._id,
                trainClass: f.trainClass._id,
                status: "confirmed",
              },
            },
            { $project: { count: { $size: "$seats" } } },
            { $group: { _id: null, total: { $sum: "$count" } } },
          ]);
          const heldCount = await SeatHold.countDocuments({
            schedule: schedule._id,
            seat: {
              $in: await Seat.find({
                coach: { $in: coaches.map((c) => c._id) },
              }).distinct("_id"),
            },
            expiresAt: { $gt: new Date() },
          });
          available = seatTotal - (bookedCount[0]?.total || 0) - heldCount;
        }

        return {
          classId: f.trainClass._id,
          code: f.trainClass.code,
          name: f.trainClass.name,
          isReserved: f.trainClass.isReserved,
          fare,
          available,
        };
      }),
    );

    matching.push({
      train: {
        _id: route.train._id,
        number: route.train.number,
        name: route.train.name,
      },
      schedule: { _id: schedule._id, date: schedule.date },
      from: {
        _id: fromStop.station._id,
        name: fromStop.station.name,
        code: fromStop.station.code,
      },
      to: {
        _id: toStop.station._id,
        name: toStop.station.name,
        code: toStop.station.code,
      },
      departure: fromStop.departure,
      arrival: toStop.arrival,
      durationMinutes: estimateDuration(fromStop.departure, toStop.arrival),
      distanceKm,
      classes,
    });
  }

  return ok(res, { trains: matching });
};

const estimateDuration = (dep, arr) => {
  if (!dep || !arr) return null;

  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);

  let mins = ah * 60 + am - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;

  return mins;
};
