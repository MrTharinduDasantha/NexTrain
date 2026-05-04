import api, { unwrap } from "./axios.js";

export const ticketApi = {
  get: (pnr) => unwrap(api.get(`/tickets/${pnr}`)),

  /**
   * Triggers a server-side PDF (pdfkit) download.
   * Resolves with a Blob the caller can pass to a download helper.
   */
  downloadServerPDF: async (pnr) => {
    const res = await api.get(`/tickets/${pnr}/download`, {
      responseType: "blob",
    });
    return res.data; // Blob
  },
};
