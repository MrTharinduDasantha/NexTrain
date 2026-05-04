import api, { unwrap } from "./axios.js";

export const scheduleApi = {
  list: (params = {}) => unwrap(api.get("/schedules", { params })),
  create: (data) => unwrap(api.post("/schedules", data)),
  update: (id, data) => unwrap(api.put(`/schedules/${id}`, data)),
  remove: (id) => unwrap(api.delete(`/schedules/${id}`)),
};
