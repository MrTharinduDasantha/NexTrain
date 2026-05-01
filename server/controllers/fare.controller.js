import Fare from "../models/fare.model.js";
import { ok, created, fail } from "../utils/response.util.js";

export const listFares = async (req, res) => {
  const filter = {};
  if (req.query.train) filter.train = req.query.train;

  const fares = await Fare.find(filter).populate("train trainClass");

  return ok(res, { fares });
};

export const upsertFare = async (req, res) => {
  const { train, trainClass, baseFare, perKmRate = 0 } = req.body;
  if (!train || !trainClass || baseFare == null) {
    return fail(res, 400, "train, trainClass and baseFare are required");
  }

  const fare = await Fare.findOneAndUpdate(
    { train, trainClass },
    { train, trainClass, baseFare, perKmRate },
    { upsert: true, new: true, runValidators: true },
  );

  return created(res, { fare }, "Fare saved");
};

export const deleteFare = async (req, res) => {
  const f = await Fare.findByIdAndDelete(req.params.id);
  if (!f) return fail(res, 404, "Fare not found");

  return ok(res, null, "Fare deleted");
};
