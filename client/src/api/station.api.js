import api, { unwrap } from "./axios.js";

export const stationApi = {
  list: () => unwrap(api.get("/stations")),
  get: (id) => unwrap(api.get(`/stations/${id}`)),
  create: (data) => unwrap(api.post("/stations", data)),
  update: (id, data) => unwrap(api.put(`/stations/${id}`, data)),
  remove: (id) => unwrap(api.delete(`/stations/${id}`)),
};
