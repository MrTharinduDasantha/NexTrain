import { Router } from "express";
import {
  listCoaches,
  createCoach,
  deleteCoach,
  blockSeat,
  unblockSeat,
} from "../controllers/coach.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Reads — useful for both admin and the user-side seat map context
router.get("/", listCoaches);

// Admin-only writes
router.post("/", authMiddleware, adminAuthMiddleware, createCoach);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteCoach);
router.put("/seats/:seatId/block", authMiddleware, adminAuthMiddleware, blockSeat);
router.put("/seats/:seatId/unblock", authMiddleware, adminAuthMiddleware, unblockSeat);

export default router;
