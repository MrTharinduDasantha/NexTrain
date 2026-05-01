import Station from "../models/station.model.js";
import { ok, created, fail } from "../utils/response.util.js";

export const listStations = async (_req, res) => {
  const stations = await Station.find().sort({ name: 1 });

  return ok(res, { stations });
};

export const getStation = async (req, res) => {
  const station = await Station.findById(req.params.id);
  if (!station) return fail(res, 404, "Station not found");

  return ok(res, { station });
};

export const createStation = async (req, res) => {
  const station = await Station.create(req.body);

  return created(res, { station }, "Station created");
};

export const updateStation = async (req, res) => {
  const station = await Station.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!station) return fail(res, 404, "Station not found");

  return ok(res, { station }, "Station updated");
};

export const deleteStation = async (req, res) => {
  const station = await Station.findByIdAndDelete(req.params.id);
  if (!station) return fail(res, 404, "Station not found");

  return ok(res, null, "Station deleted");
};
