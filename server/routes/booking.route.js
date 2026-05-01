import { Router } from "express";
import {
  initiateBooking,
  myBookings,
  getBooking,
  cancelBooking,
  adminListBookings,
} from "../controllers/booking.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.use(authMiddleware);

// User
router.post("/initiate", initiateBooking);
router.get("/mine", myBookings);
router.get("/:id", getBooking);
router.put("/:id/cancel", cancelBooking);

// Admin
router.get("/admin/list", adminAuthMiddleware, adminListBookings);

export default router;
