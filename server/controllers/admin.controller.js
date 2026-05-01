import Booking from "../models/booking.model.js";
import Train from "../models/train.model.js";
import { ok } from "../utils/response.util.js";

export const dashboardStats = async (_req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [
    bookingsToday,
    revenueToday,
    totalActiveTrains,
    last7Revenue,
    last7Bookings,
  ] = await Promise.all([
    Booking.countDocuments({
      status: "confirmed",
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    }),
    Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      { $group: { _id: null, total: { $sum: "$fare.total" } } },
    ]),
    Train.countDocuments({ isActive: true }),
    Booking.aggregate([
      {
        $match: {
          status: "confirmed",
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$fare.total" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Total seats filled today (sum of seats per confirmed booking)
  const seatsFilledTodayAgg = await Booking.aggregate([
    {
      $match: {
        status: "confirmed",
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      },
    },
    { $project: { count: { $size: "$seats" } } },
    { $group: { _id: null, total: { $sum: "$count" } } },
  ]);

  return ok(res, {
    bookingsToday,
    revenueToday: revenueToday[0]?.total || 0,
    totalActiveTrains,
    seatsFilledToday: seatsFilledTodayAgg[0]?.total || 0,
    last7Revenue,
    last7Bookings,
  });
};
