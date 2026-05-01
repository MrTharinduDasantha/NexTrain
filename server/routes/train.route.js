import { Router } from "express";
import {
  listTrains,
  getTrain,
  createTrain,
  updateTrain,
  deleteTrain,
  searchTrains,
} from "../controllers/train.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Public — train listing & search
router.get("/search", searchTrains);
router.get("/", listTrains);
router.get("/:id", getTrain);

// Admin
router.post("/", authMiddleware, adminAuthMiddleware, createTrain);
router.put("/:id", authMiddleware, adminAuthMiddleware, updateTrain);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteTrain);

export default router;
