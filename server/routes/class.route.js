import { Router } from "express";
import {
  listClasses,
  getClass,
  upsertClass,
  seedClasses,
} from "../controllers/class.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Public — needed for "View Train Classes" page
router.get("/", listClasses);
router.get("/:id", getClass);

// Admin
router.post("/seed", authMiddleware, adminAuthMiddleware, seedClasses);
router.post("/", authMiddleware, adminAuthMiddleware, upsertClass);
router.put("/", authMiddleware, adminAuthMiddleware, upsertClass);

export default router;
