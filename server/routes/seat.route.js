import { Router } from "express";
import { getSeatMap, holdSeats, releaseSeats } from "../controllers/seat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Seat map can be viewed without auth, but if the user is logged in we annotate "selected by me"
router.get("/map", (req, _res, next) => {
  // Soft-auth: try to attach req.user if cookie is present, otherwise continue
  const tokenPresent = req.cookies?.token || req.headers.authorization;
  if (tokenPresent) return authMiddleware(req, _res, next);
  next();
}, getSeatMap);

// Holding / releasing requires auth
router.post("/hold", authMiddleware, holdSeats);
router.post("/release", authMiddleware, releaseSeats);

export default router;
