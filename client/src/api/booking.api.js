import api, { unwrap } from "./axios.js";

export const bookingApi = {
  /**
   * Create a pending booking (status: pending_payment).
   * payload: { scheduleId, trainClassId, seatIds, fromStation, toStation, passengers }
   */
  initiate: (payload) => unwrap(api.post("/bookings/initiate", payload)),

  myBookings: () => unwrap(api.get("/bookings/mine")),
  get: (id) => unwrap(api.get(`/bookings/${id}`)),
  cancel: (id) => unwrap(api.put(`/bookings/${id}/cancel`)),

  /* Admin */
  adminList: (params = {}) =>
    unwrap(api.get("/bookings/admin/list", { params })),
};
