import { getChannelStats } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router()
router.use(verifyJWT)

router.route("/stats").get(getChannelStats)

export default router