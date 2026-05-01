import Passenger from "../models/passenger.model.js";
import { ok, fail } from "../utils/response.util.js";

export const passengersForTrainDate = async (req, res) => {
  const { trainId, date } = req.query;
  if (!trainId || !date) return fail(res, 400, "trainId and date are required");

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const next = new Date(day);
  next.setDate(next.getDate() + 1);
  const passengers = await Passenger.find({
    train: trainId,
    journeyDate: { $gte: day, $lt: next },
  })
    .populate("trainClass")
    .sort({ coachNumber: 1, seatNumber: 1 });

  return ok(res, { passengers });
};
