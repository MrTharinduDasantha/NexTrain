import { Router } from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", upload.single("profilePhoto"), updateProfile);
router.put("/password", changePassword);

export default router;
