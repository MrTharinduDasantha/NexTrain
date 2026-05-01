import { Router } from "express";
import { getTicket, downloadTicket } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/:pnr", getTicket);
router.get("/:pnr/download", downloadTicket);

export default router;
