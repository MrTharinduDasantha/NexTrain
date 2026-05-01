import { Router } from "express";
import {
  listStations,
  getStation,
  createStation,
  updateStation,
  deleteStation,
} from "../controllers/station.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Public reads — needed by the train search form
router.get("/", listStations);
router.get("/:id", getStation);

// Admin writes
router.post("/", authMiddleware, adminAuthMiddleware, createStation);
router.put("/:id", authMiddleware, adminAuthMiddleware, updateStation);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteStation);

export default router;
