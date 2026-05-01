import Schedule from "../models/schedule.model.js";
import { ok, created, fail } from "../utils/response.util.js";

export const listSchedules = async (req, res) => {
  const filter = {};

  if (req.query.train) filter.train = req.query.train;
  if (req.query.from && req.query.to) {
    filter.date = {
      $gte: new Date(req.query.from),
      $lte: new Date(req.query.to),
    };
  }

  const schedules = await Schedule.find(filter)
    .populate("train")
    .sort({ date: 1 });

  return ok(res, { schedules });
};

export const createSchedule = async (req, res) => {
  const schedule = await Schedule.create(req.body);

  return created(res, { schedule }, "Schedule created");
};

export const updateSchedule = async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!schedule) return fail(res, 404, "Schedule not found");

  return ok(res, { schedule }, "Schedule updated");
};

export const deleteSchedule = async (req, res) => {
  const s = await Schedule.findByIdAndDelete(req.params.id);
  if (!s) return fail(res, 404, "Schedule not found");

  return ok(res, null, "Schedule deleted");
};
