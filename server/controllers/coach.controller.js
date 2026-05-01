import Coach from "../models/coach.model.js";
import Seat from "../models/seat.model.js";
import { ok, created, fail } from "../utils/response.util.js";

const COL_LETTERS = ["A", "B", "C", "D", "E", "F"];

export const listCoaches = async (req, res) => {
  const filter = {};

  if (req.query.train) filter.train = req.query.train;
  if (req.query.trainClass) filter.trainClass = req.query.trainClass;

  const coaches = await Coach.find(filter).populate("trainClass");

  return ok(res, { coaches });
};

export const createCoach = async (req, res) => {
  const {
    train,
    trainClass,
    coachNumber,
    rows,
    columns,
    aisleAfterColumn = 1,
    seatNumberingPattern,
  } = req.body;
  if (!train || !trainClass || !coachNumber || !rows || !columns) {
    return fail(
      res,
      400,
      "train, trainClass, coachNumber, rows, columns are required",
    );
  }

  const coach = await Coach.create({
    train,
    trainClass,
    coachNumber,
    rows,
    columns,
    aisleAfterColumn,
    seatNumberingPattern,
  });

  // Generate seats
  const seats = [];
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      const seatNumber =
        seatNumberingPattern === "SEQ"
          ? `${(r - 1) * columns + c}`
          : `${r}${COL_LETTERS[c - 1] || c}`;
      seats.push({ coach: coach._id, seatNumber, row: r, column: c });
    }
  }
  await Seat.insertMany(seats);

  return created(
    res,
    { coach, seatsCreated: seats.length },
    "Coach + seat layout created",
  );
};

export const deleteCoach = async (req, res) => {
  const c = await Coach.findByIdAndDelete(req.params.id);
  if (!c) return fail(res, 404, "Coach not found");

  await Seat.deleteMany({ coach: c._id });

  return ok(res, null, "Coach deleted");
};

export const blockSeat = async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(
    req.params.seatId,
    { isBlocked: true, blockReason: req.body.reason || "Maintenance" },
    { new: true },
  );

  if (!seat) return fail(res, 404, "Seat not found");

  return ok(res, { seat }, "Seat blocked");
};

export const unblockSeat = async (req, res) => {
  const seat = await Seat.findByIdAndUpdate(
    req.params.seatId,
    { isBlocked: false, blockReason: "" },
    { new: true },
  );

  if (!seat) return fail(res, 404, "Seat not found");

  return ok(res, { seat }, "Seat unblocked");
};
