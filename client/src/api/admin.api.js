import api, { unwrap } from "./axios.js";

export const adminApi = {
  dashboard: () => unwrap(api.get("/admin/dashboard")),

  /** Passengers for a given train + journey date */
  passengers: ({ trainId, date }) =>
    unwrap(
      api.get("/admin/passengers", {
        params: {
          trainId,
          date: date instanceof Date ? date.toISOString() : date,
        },
      }),
    ),
};
