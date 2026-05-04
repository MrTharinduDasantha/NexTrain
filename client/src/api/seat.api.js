import api, { unwrap } from "./axios.js";

export const seatApi = {
  /** Seat map for a schedule + class (returns coaches and seat statuses) */
  getMap: ({ scheduleId, trainClassId }) =>
    unwrap(api.get("/seats/map", { params: { scheduleId, trainClassId } })),

  /** Place 10-minute holds on selected seats. */
  hold: ({ scheduleId, trainClassId, seatIds, fromStation, toStation }) =>
    unwrap(
      api.post("/seats/hold", {
        scheduleId,
        trainClassId,
        seatIds,
        fromStation,
        toStation,
      }),
    ),

  /** Release seats the user is currently holding. */
  release: ({ scheduleId, seatIds, trainClassId }) =>
    unwrap(api.post("/seats/release", { scheduleId, seatIds, trainClassId })),

  /* --- Coach + seat admin --- */
  listCoaches: (params = {}) => unwrap(api.get("/coaches", { params })),
  createCoach: (data) => unwrap(api.post("/coaches", data)),
  removeCoach: (id) => unwrap(api.delete(`/coaches/${id}`)),
  blockSeat: (seatId, reason) =>
    unwrap(api.put(`/coaches/seats/${seatId}/block`, { reason })),
  unblockSeat: (seatId) => unwrap(api.put(`/coaches/seats/${seatId}/unblock`)),
};
