import api, { unwrap } from "./axios.js";

export const authApi = {
  register: (formData) =>
    unwrap(
      api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),

  login: ({ email, password }) =>
    unwrap(api.post("/auth/login", { email, password })),

  adminLogin: ({ email, password }) =>
    unwrap(api.post("/auth/admin/login", { email, password })),

  logout: () => unwrap(api.post("/auth/logout")),

  me: () => unwrap(api.get("/auth/me")),
};
