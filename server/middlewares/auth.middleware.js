import { verifyToken } from "../utils/token.util.js";
import { fail } from "../utils/response.util.js";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);
    if (!token) return fail(res, 401, "Not authenticated");

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return fail(res, 401, "User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    return fail(res, 401, "Invalid or expired token");
  }
};
