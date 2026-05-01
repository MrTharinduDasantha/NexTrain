import { Router } from "express";
import { createCheckoutSession, verifyAndConfirm } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/checkout-session", createCheckoutSession);
router.post("/verify", verifyAndConfirm);

export default router;
