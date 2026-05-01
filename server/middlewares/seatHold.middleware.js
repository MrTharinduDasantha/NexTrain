import SeatHold from "../models/seatHold.model.js";
import { fail } from "../utils/response.util.js";

/**
 * Validates that the requesting user currently holds all seatIds for this schedule.
 * Expects req.body.scheduleId and req.body.seatIds (array).
 */
export const verifySeatHolds = async (req, res, next) => {
  try {
    const { scheduleId, seatIds } = req.body;
    if (!scheduleId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return fail(res, 400, "scheduleId and seatIds are required");
    }

    const holds = await SeatHold.find({
      schedule: scheduleId,
      seat: { $in: seatIds },
      user: req.user._id,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (holds.length !== seatIds.length) {
      return fail(
        res,
        409,
        "One or more seat holds have expired or do not belong to you",
      );
    }

    req.seatHolds = holds;
    next();
  } catch (err) {
    next(err);
  }
};
