import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"


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

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike
  
}