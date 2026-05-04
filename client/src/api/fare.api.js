import api, { unwrap } from "./axios.js";

export const fareApi = {
  list: (params = {}) => unwrap(api.get("/fares", { params })),
  upsert: (data) => unwrap(api.put("/fares", data)),
  remove: (id) => unwrap(api.delete(`/fares/${id}`)),
};
