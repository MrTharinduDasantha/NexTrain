import api, { unwrap } from "./axios.js";

export const reportApi = {
  revenue: (params = {}) => unwrap(api.get("/reports/revenue", { params })),
  occupancy: (params = {}) => unwrap(api.get("/reports/occupancy", { params })),

  /** Triggers a server-side PDF (pdfkit) export — returns a Blob. */
  revenuePDF: async (params = {}) => {
    const res = await api.get("/reports/revenue/pdf", {
      params,
      responseType: "blob",
    });
    return res.data;
  },
};
