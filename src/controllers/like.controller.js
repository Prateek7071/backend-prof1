import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"
import mongoose from "mongoose"


const toggleVideoLike = asyncHandler(async (req, res) => {
  const {videoId} = req.params
  if (!videoId) {
    throw new ApiError(400, "Video not found")
  }

  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id
  })

  const likedVideo=""
  if (!isLiked) {
    likedVideo = await Like.create({
      $set: {
        video: videoId,
        likedBy: req.user?._id
      }
    })
  }
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked?._id)
  }

  return res.
    status(200).
    json(new ApiResponse(200, likedVideo, isLiked ? "Disliked Video" : "Liked Video"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const {commentId} = req.params
  if (!commentId) {
    throw new ApiError(400, "Comment not found")
  }

  const isLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id
  })

  const likedComment=""
  if (!isLiked) {
    likedComment = await Like.create({
      $set: {
        comment: commentId,
        likedBy: req.user?._id
      }
    })
  }
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked?._id)
  }

  return res.
    status(200).
    json(new ApiResponse(200, likedComment, isLiked ? "Disliked comment" : "Liked comment"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!tweetId) {
    throw new ApiError(400, "Tweet not found")
  }

  const isLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id
  })

  const likedTweet = ""
  if (!isLiked) {
    likedTweet = await Like.create({
      $set: {
        tweet: tweetId,
        likedBy: req.user?._id
      }
    })
  }
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked?._id)
  }

  return res.
    status(200).
    json(new ApiResponse(200, likedTweet, isLiked ? "Disliked tweet" : "Liked tweet"))

})

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      sort: {createdAt:-1}
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",

        pipeline: [
          {
            $unwind: "$videoDetails"
          },
          {
            $project: {
              createdAt: 1,
              updatedAt: 1,
              VideoCreatedAt: "$videoDetails.createdAt",
              thumbnail: "$videoDetails.thumbnail",
              title: "$videoDetails.title",
              duration: "$videoDetails.duration",
              views: "$videoDetails.views",
              videoOwner: "$videoDetails.owner"
            }
          }
        ]
      }
    }
  ])

  if (!likedVideos) {
    throw new ApiError(500,"Cant retrieve liked videos")
  }

  return res.status(200).json(new ApiResponse(200,likedVideos,"Liked videos retrieved"))
})

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}