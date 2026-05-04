import api, { unwrap } from "./axios.js";

export const classApi = {
  list: () => unwrap(api.get("/classes")),
  get: (id) => unwrap(api.get(`/classes/${id}`)),
  upsert: (data) => unwrap(api.put("/classes", data)),
  seed: () => unwrap(api.post("/classes/seed")),
};
