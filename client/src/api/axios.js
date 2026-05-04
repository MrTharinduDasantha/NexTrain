import axios from "axios";
import { toast } from "react-toastify";

/**
 * Base URL strategy:
 *   - In development, leave VITE_API_URL blank to use Vite's proxy (`/api` → server).
 *   - In production, set VITE_API_URL to your deployed API origin
 *     (e.g. https://nex-train.vercel.app). Requests will hit `<URL>/api/...`.
 */
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL,
  withCredentials: true, // send the JWT cookie
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

/* ---------- Optional Bearer fallback ----------
   If we ever need to authenticate where cookies aren't allowed
   (e.g. some embedded contexts), we also send the token in the
   Authorization header when present in localStorage. */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nextrain_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------- Response interceptor ----------
   Normalise errors into a consistent shape and surface
   network failures as toasts. Auth errors trigger a soft
   logout via a CustomEvent the auth slice listens for. */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error. Please try again.";

    if (status === 401) {
      // Don't toast on initial /me probe — App.jsx handles it silently
      const url = error.config?.url || "";
      if (!url.endsWith("/auth/me")) {
        window.dispatchEvent(new CustomEvent("nextrain:unauthorized"));
        toast.error("Your session has expired. Please log in again.");
      }
    } else if (status === 403) {
      toast.error(message || "You don't have permission for that action.");
    } else if (status >= 500) {
      toast.error("Server error. Please try again in a moment.");
    } else if (!error.response) {
      toast.error("Cannot reach the server. Check your connection.");
    }

    return Promise.reject({
      status,
      message,
      details: error.response?.data?.details,
      raw: error,
    });
  },
);

/* ---------- Tiny helper: unwrap `{ success, message, data }` ---------- */
export const unwrap = (promise) =>
  promise.then((res) => {
    const body = res?.data;
    if (body && typeof body === "object" && "data" in body) return body.data;
    return body;
  });

export default api;
