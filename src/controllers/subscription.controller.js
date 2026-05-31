import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params
  if (!channelId) {
    throw new ApiError(400,"channelId required")
  }
 
    const subscriberId = req.user?._id

    if (channelId.toString().trim() === subscriberId.toString().trim()) {
      throw new ApiError(422, "Subscription not possible")
    }

    const isSubscriber = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (isSubscriber) {
      await Subscription.findByIdAndDelete(isSubscriber?._id)
    }

    let newSubscriber=""
    
    if (!isSubscriber) {
      newSubscriber = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
      })

    if (!newSubscriber) {
      throw new ApiError(500, "Failed to subscribe")
    }
    }

  return res
    .status(200)
    .json(new ApiResponse(200, {
      subscribed: !isSubscriber,
      data: newSubscriber
    } ,isSubscriber?"Unsubscribed":"Subscribed" ))
      
})

export {
  toggleSubscription
}