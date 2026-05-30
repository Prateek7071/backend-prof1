import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const tweet = await Tweet.create({
    owner: req.user?._id,
    content
  })

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created"))
})

//TODO: needs modification
const getUserTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {      
      $project: {
        content:1
      }
    }
  ])
  console.log("tweets:  ",tweets)

  return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content) {
    throw new ApiError(400, "Content required")
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(req.user?._id, {
    $set: {
      content
    }
  })
  return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated"))
  
})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  if (!tweetId) {
    throw new ApiError(400,"Tweet doesnt exist")
  }
  await Tweet.findByIdAndDelete(tweetId)

  return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"))
  
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}