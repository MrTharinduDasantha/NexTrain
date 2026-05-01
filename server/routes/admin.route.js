import { Router } from "express";
import { dashboardStats } from "../controllers/admin.controller.js";
import { passengersForTrainDate } from "../controllers/passenger.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminAuthMiddleware } from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.use(authMiddleware, adminAuthMiddleware);

router.get("/dashboard", dashboardStats);
router.get("/passengers", passengersForTrainDate);

export default router;
