import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
)

router.route("/login").post(loginUser)

//secure route
router.route("/logout").post(verifyJWT, logoutUser) //here verifyJWT is a middleware and contains next so when its done goes to logoutUser // and now we logoutUser has access to user back in user.controller
router.route("/refresh-token").post(refreshAccessToken)

export default router