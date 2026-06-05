import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {

  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId required");
  }

  const subscriberId = req.user?._id;

  if (channelId.toString().trim() === subscriberId.toString().trim()) {
    throw new ApiError(422, "Subscription not possible");
  }

  const isSubscriber = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (isSubscriber) {
    await Subscription.findByIdAndDelete(isSubscriber?._id);
  }

  let newSubscriber = "";

  if (!isSubscriber) {
    newSubscriber = await Subscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (!newSubscriber) {
      throw new ApiError(500, "Failed to subscribe");
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        subscribed: !isSubscriber,
        data: newSubscriber,
      },
      isSubscriber ? "Unsubscribed" : "Subscribed"
    )
  );

  //alternative code, cause added indexing to both and unique

  // try {
  //   await Subscription.create({ subscriber, channel })
  // } catch (err) {
  //   if (err.code === 11000) {
  //     // here just toggle delete
  //   }
  // }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  if (!channelId) {
    throw new ApiError(400, "Channel doesnt exist");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "SubscribedUserDetails",
        pipeline: [{
          $project: {
            fullname: 1,
            username: 1,
            avatar: 1
          }
        }
          ]
      }
    },
    {
      $unwind:"$SubscribedUserDetails"
    },
    {
      $project: {
        _id: 0,
        channelId: "$SubscribedUserDetails._id",
        fullname: "$SubscribedUserDetails.fullname",
        username: "$SubscribedUserDetails.username",
        avatar: "$SubscribedUserDetails.avatar",
        subscribedAt: "$createdAt"
      }
    }
  ])
  console.log("All subs of channel: ",subscribers)
  if (!subscribers) {
    throw new ApiError(400,"No subscribers found")
  }

  return res.status(200).json(new ApiResponse(200,subscribers,"List of subscriber fetched"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params

  if (!subscriberId) {
    throw new ApiError(400, "Subscriber not found")
  }

  const subscribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelsDetails",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $unwind: "$subscribedChannelsDetails"
    },
    {
      $project: {
        _id: 0,
        subscriberId: "$subscribedChannelsDetails._id",
        fullname: "$subscribedChannelsDetails.fullname",
        username: "$subscribedChannelsDetails.username",
        avatar: "$subscribedChannelsDetails.avatar",
        subscribedAt: "$createdAt"
      }
    }
  ])

  return res.status(200).json(new ApiResponse(200, subscribed,"Fetched subscribed channels list"))
})

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels

}
