import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body
  if (!content.trim()) {
    throw new ApiError(400, "Content required")
  }

  const tweet = await Tweet.create({
    owner: req.user?._id,
    content
  })

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created"))
})

//TODO: decide if anyone can get anyones tweets? for now they can.
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!userId.trim()) {
    throw new ApiError(400,"User not found")
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $sort: {createdAt: -1}
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails"
      }
    },
    {
      $unwind:"$ownerDetails"
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: "$ownerDetails._id",
        fullname: "$ownerDetails.fullname",
        avatar:"$ownerDetails.avatar",
        username:"$ownerDetails.username"
      }
    }
  ])
  console.log("tweets: ",tweets)
  
  return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet doesnt exist");
  }
  const { content } = req.body;
  if (!content.trim()) {
    throw new ApiError(400, "Content required");
  }

  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      owner: req.user?._id,
      _id: tweetId,
    },
    {
      $set: {
        content,
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!updatedTweet) {
    throw new ApiError(404, "Cant update tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated"));
})

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet doesnt exist");
  }

  const deletedTweet = await Tweet.findOneAndDelete({
    owner: req.user?._id,
    _id: tweetId,
  });

  if (!deletedTweet) {
    throw new ApiError(404, "Cant delete tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}
