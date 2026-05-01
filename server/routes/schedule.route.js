import { Router } from "express";
import {
  listSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", listSchedules);
router.post("/", authMiddleware, adminAuthMiddleware, createSchedule);
router.put("/:id", authMiddleware, adminAuthMiddleware, updateSchedule);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteSchedule);

export default router;
