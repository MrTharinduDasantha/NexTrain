import Route from "../models/route.model.js";
import { ok, created, fail } from "../utils/response.util.js";

export const listRoutes = async (_req, res) => {
  const routes = await Route.find().populate("train stops.station");

  return ok(res, { routes });
};

export const getRoute = async (req, res) => {
  const route = await Route.findById(req.params.id).populate(
    "train stops.station",
  );
  if (!route) return fail(res, 404, "Route not found");

  return ok(res, { route });
};

export const upsertRoute = async (req, res) => {
  const { train, stops } = req.body;
  if (!train || !Array.isArray(stops) || stops.length < 2) {
    return fail(res, 400, "train and at least 2 stops are required");
  }

  const route = await Route.findOneAndUpdate(
    { train },
    { train, stops },
    { upsert: true, new: true, runValidators: true },
  );

  return created(res, { route }, "Route saved");
};

export const deleteRoute = async (req, res) => {
  const route = await Route.findByIdAndDelete(req.params.id);
  if (!route) return fail(res, 404, "Route not found");

  return ok(res, null, "Route deleted");
};
