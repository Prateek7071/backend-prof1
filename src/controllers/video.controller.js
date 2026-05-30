import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import { uploadOnCloudinary,uploadVideoOnCloudinary } from "../utils/cloudinary.js"

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body
  
  if (!(title || description)) throw new ApiError(400, "Missing title or description")

  const thumbnailLocalPath = req.files?.thumbnail[0]?.path

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail not found")
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

  if (!thumbnail) {
    throw new ApiError(400,"Thumbnail failed to upload on cloudinary")
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file not found")
  }

  const videoFile = await uploadVideoOnCloudinary(videoFileLocalPath) 

  console.log("video File from c : ",videoFile)

  if (!videoFile) {
    throw new ApiError(400, "Failed to upload video file on cloudinarty")
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration,
    owner: req.user?._id
  }) 

  const publishedVideo = await Video.findById(video._id)

  if (!publishedVideo) {
    throw new ApiError(500, "Something went wrong while publishing video")
  }

  console.log("The publishVideo: ", publishedVideo)

  return res
    .status(200)
    .json(new ApiResponse(200, publishedVideo,"Video published successfully!"))
})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!videoId?.trim()) {
    throw new ApiError(400, "video Id not found")
  }
  const video = Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, "Video doesnt exist")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Retrieved video successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  
})
export {
  publishAVideo, getVideoById
}