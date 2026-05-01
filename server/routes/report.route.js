import { Router } from "express";
import {
  revenueReport,
  occupancyReport,
  exportRevenuePDF,
} from "../controllers/report.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.use(authMiddleware, adminAuthMiddleware);

router.get("/revenue", revenueReport);
router.get("/occupancy", occupancyReport);
router.get("/revenue/pdf", exportRevenuePDF);

export default router;
