import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like 
  //  total video views- videos,
  //  total subscribers- subs,
  //  total videos- video,
  //  total likes, etc

  // approach 1: not good, subs implementation not optimal DONT USE
  // const stats = await Video.aggregate([
  //   {
  //     $match: { owner: new mongoose.Types.ObjectId(req.user?._id) }
  //   },
  //   {
  //     $facet: {
  //       metadata: [{ $count: "totalVideos" }],
  //       views: [
  //         {
  //           $group: {
  //             _id: null,
  //             totalViews: { $sum: "$views" }
  //           }
  //         }
  //       ],
  //       likes: [
  //         {
  //           $lookup: {
  //             from: "likes",
  //             localField: "_id",
  //             foreignField: "video",
  //             as: "likedList",
  //           }
  //         },
  //         {
  //           $count: "totalLikes"
  //         }
  //       ],
  //       subs: [
  //         {
  //           $lookup: {
  //             from: "subscribers",
  //             localField: "owner",
  //             foreignField: "channel",
  //             as: "subs"
  //           }
  //         },
  //         {
  //           $count: "totalSubs"
  //         }
  //       ]
  //     }
  //   },
  //   {
  //     $project: {
  //       totalVideos: { $ifNull: [{ $arrayElemAt: ["$metadata.totalVideos", 0] }, 0] },
  //       totalViews:  { $ifNull: [{ $arrayElemAt: ["$views.totalViews", 0] }, 0] },
  //       totalLikes:  { $ifNull: [{ $arrayElemAt: ["$likes.totalLikes", 0] }, 0] },
  //       totalSubs:   { $ifNull: [{ $arrayElemAt: ["$subs.totalSubs", 0] }, 0] }
  //     }
  //   }
  // ])

  const channelId = new mongoose.Types.ObjectId(req.user?._id)
  if (!channelId) {
    throw new ApiError(400, "Channel not found")
  }
  const videoStats = await Video.aggregate([
    { $match: { owner: channelId } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes"
      }
    },
    {
      $group: {
        _id: null,
        totalVidoes: { $sum: 1 },
        totalViews: { $sum: "$views" },
        totalLikes: { $sum: { $size: "$likes" } }
      }
    }
  ])

  const totalSubs = await Subscription.countDocuments({channel: channelId})

  const stats = {
    totalVidoes: videoStats[0]?.totalVidoes || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: videoStats[0]?.totalLikes || 0,
    totalSubs
  }
  
  console.log(stats[0])
  return res.status(200).json(new ApiResponse(200, stats, "Stats retrieved"))
})


const getChannelVideos = asyncHandler(async (req, res) => {

  const channelId = new mongoose.Types.ObjectId(req?.user._id)

  if (!channelId) {
    throw new ApiError(400, "Channel not found")
  }
  
  const allVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req?.user._id)
      },
    },
    {
      $sort:{"createdAt": -1}
    },
    {
      $project: {
        owner: 0,
      }
    }
   ])
 
 return res.status(200).json(new ApiResponse(200,allVideos,"All videos retrieved")) 
})


export {
  getChannelStats,
  getChannelVideos
}