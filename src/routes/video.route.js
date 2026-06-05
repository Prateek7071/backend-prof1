import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router()

router.route("/publish-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1
    },
    {
      name: "videoFile",
      maxCount: 1
    }
  ]),
  publishAVideo
)
router.route("/").get(verifyJWT,getAllVideos)
router.route("/:videoId").get(getVideoById)
router.route("/update-video/:videoId").post(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/update-publish-status/:videoId").post(verifyJWT, togglePublishStatus)
router.route("/delete-video/:videoId").delete(verifyJWT,deleteVideo)
  
export default router