import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"
import { uploadOnCloudinary,uploadVideoOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

//TODO: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
 
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

  if (!userId) {
    throw new ApiError(400, "User not found")
  }
  const pageNumber = parseInt(page, 10)
  const limitNumber = parseInt(limit,10)
  const options = {
    page: pageNumber,
    limit: limitNumber,
    sort: {[sortBy||"createdAt"]:sortType === "desc"? -1:1}
  }
  const pipeline = []
  pipeline.push({ $match: { owner: new mongoose.Types.ObjectId(userId) } })

  if (query) {
    pipeline.push({ $match: { title: { $regex: query, $options: 'i' } } })
  }

  const newAggregate = Video.aggregate(pipeline)

  const videos = await Video.aggregatePaginate(newAggregate, options)

  return res.status(200).json(new ApiResponse(200, videos, "Retrieved all user videos"))
  
})

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
  const video =await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, "Video doesnt exist")
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Retrieved video successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { title, description } = req.body
  if (!videoId) {
    throw new ApiError(400, "Video id not found")
  }
  if (!(title || description)) {
    throw new ApiError(400,"Fields are required")
  }
  try { 
    let updateData = { title, description }
    console.log("req.file: ",req.file)
    let thumbnailLocalPath;
    if (req.file) {
      thumbnailLocalPath = req.file.path
    }  

    console.log("thumbnail local path:",thumbnailLocalPath)
  
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    
    if (thumbnail?.url) {
      updateData.thumbnail = thumbnail.url
    }

    console.log("thumbnail on cloudinary:", thumbnail)
    
    const video =await Video.findByIdAndUpdate(videoId, {
      $set: updateData
    },
    {
      returnDocument: 'after'
    })
  
    return res
      .status(200)
      .json(new ApiResponse(200,video,"Updated video successfully"))
    } catch (error) {
      throw new ApiError(400, "Error updating video")
  }
  
})

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  if (!videoId) {
    throw new ApiError(400, "Video id not found")
  }
  const video = await Video.findById(videoId) //can this be avoided?
  const state =await Video.findByIdAndUpdate(videoId, {
    $set: {
      isPublished: !video.isPublished
    }
  })
  return res.status(200).json(new ApiResponse(200,state,"Publish state updated"))
})

//TODO: implement deletion on cloudinary
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params

  if (!videoId) {
    throw new ApiError(400, "Video id not found")
  }
  //TODO: implement deletion on cloudinary
  const cloudVideo = await deleteFromCloudinary(videoId)
  
  console.log("CloudVideo: ", cloudVideo)
  
  // if (cloudVideo.result !== "ok") {
  //   throw new ApiError(500, "Failed to delete video from cloudinary")
  // }

  await Video.findByIdAndDelete(videoId)

  return res.status(200).json(new ApiResponse(200, {}, "Deleted successfully"))
  
})

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo
}