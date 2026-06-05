import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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
router.route("/update-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)//will only update necessary ones, if we do post will update everything which we dont want here.
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCover)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile) //here cause in the getUserChannelProfile we using req.params we need to focus on route that it contains username like this to use it later.
router.route("/watch-history").get(verifyJWT, getWatchHistory)//user is not sending anything so we just use get
export default router