import api, { unwrap } from "./axios.js";

export const userApi = {
  getProfile: () => unwrap(api.get("/users/profile")),

  updateProfile: (formData) =>
    unwrap(
      api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    ),

  changePassword: ({ currentPassword, newPassword }) =>
    unwrap(api.put("/users/password", { currentPassword, newPassword })),
};
