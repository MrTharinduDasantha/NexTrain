import api, { unwrap } from "./axios.js";

export const trainApi = {
  list: () => unwrap(api.get("/trains")),
  get: (id) => unwrap(api.get(`/trains/${id}`)),
  create: (data) => unwrap(api.post("/trains", data)),
  update: (id, data) => unwrap(api.put(`/trains/${id}`, data)),
  remove: (id) => unwrap(api.delete(`/trains/${id}`)),

  /**
   * Public train search.
   * @param {Object} params  { from, to, date }   (date may be Date or ISO string)
   */
  search: ({ from, to, date }) =>
    unwrap(
      api.get("/trains/search", {
        params: {
          from,
          to,
          date: date instanceof Date ? date.toISOString() : date,
        },
      }),
    ),

  /* --- Route management (admin) --- */
  listRoutes: () => unwrap(api.get("/routes")),
  getRoute: (id) => unwrap(api.get(`/routes/${id}`)),
  saveRoute: ({ train, stops }) => unwrap(api.put("/routes", { train, stops })),
  removeRoute: (id) => unwrap(api.delete(`/routes/${id}`)),
};
