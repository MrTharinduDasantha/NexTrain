import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  registerValidators,
  login,
  loginValidators,
  logout,
  me,
  adminLogin,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Rate limit auth endpoints to mitigate brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." },
});

router.post("/register", authLimiter, upload.single("profilePhoto"), registerValidators, register);
router.post("/login", authLimiter, loginValidators, login);
router.post("/admin/login", authLimiter, adminLogin);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
