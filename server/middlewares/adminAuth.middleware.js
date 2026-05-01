import { fail } from "../utils/response.util.js";

export const adminAuthMiddleware = (req, res, next) => {
  if (!req.user) return fail(res, 401, "Not authenticated");

  if (req.user.role !== "admin")
    return fail(res, 403, "Admin privileges required");

  next();
};
