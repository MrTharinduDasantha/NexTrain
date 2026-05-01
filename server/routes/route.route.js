import { Router } from "express";
import {
  listRoutes,
  getRoute,
  upsertRoute,
  deleteRoute,
} from "../controllers/route.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

// Public reads (so a logged-in user can see the route stops on a train detail page)
router.get("/", listRoutes);
router.get("/:id", getRoute);

// Admin upsert / delete
router.post("/", authMiddleware, adminAuthMiddleware, upsertRoute);
router.put("/", authMiddleware, adminAuthMiddleware, upsertRoute);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteRoute);

export default router;
