import { Router } from "express";
import { listFares, upsertFare, deleteFare } from "../controllers/fare.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", listFares);
router.post("/", authMiddleware, adminAuthMiddleware, upsertFare);
router.put("/", authMiddleware, adminAuthMiddleware, upsertFare);
router.delete("/:id", authMiddleware, adminAuthMiddleware, deleteFare);

export default router;
