import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const {videoId} = req.params
  const {page = 1, limit = 10} = req.query
  if(!videoId) {
    throw new ApiError(400, "Video not found")
  }

  const pageNumber = parseInt(page, 10)
  const limitNumber = parseInt(limit, 10)
  const videoComments = await Comment.aggregate([
    {
      $match: new mongoose.Types.ObjectId(videoId)
    },
    {
      $sort:{createdAt: -1}
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
      $unwind: "$ownerDetails"
    },
    {
      $facet: { 
        metadata: [{ $count: "total" }],
        data: [
          { $skip: (pageNumber - 1) * limitNumber },
          { $limit: limitNumber },
          { //cleaning output everytime
            $project: {
              content: 1,
              createdAt: 1,
              owner: "$ownerDetails._id",
              fullname: "$ownerDetails._fullname",
              avatar: "$ownerDetails._avatar",
              username: "$ownerDetails._username"
            }
          }
        ]
      }
    }
  ])

  if (!videoComments) {
    throw new ApiError(500,"Cant retrieve data")
  }
  console.log(videoComments)
  const total = videoComments[0].metadata[0]?.total || 0;
  const data = videoComments[0].data

  return res
    .status(200)
    .json(new ApiResponse(200, {
      totalComments: total,
      data: data
    }, "All comments retrieved successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  const { content } = req.body
  
  if(!videoId) {
    throw new ApiError(400, "Video not found")
  }

  if(!content) {
    throw new ApiError(400, "Comment field cant be empty")
  }
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id
  })

  if (!comment) {
    throw new ApiError(500,"Comment failed to publish")
  }

  return res.status(200).json(new ApiResponse(200,comment,"Comment published"))
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { content } = req.body

  if (!commentId) {
    throw new ApiError(400,"Comment doesnt exist")
  }
  if (!content) {
    throw new ApiError(400,"Nothing to update")
  }
  const isAuthorised = await Comment.findOne({
    owner: req.user?._id,
    _id: commentId
  })
  if (!isAuthorised) {
    throw new ApiError(403,"Not authorised to update comment")
  }
  let updatedComment=""
  if (isAuthorised) {
    updatedComment = await Comment.findByIdAndUpdate(
      commentId , {
        $set: { content }
    }) 
  }

  if (!updatedComment) {
    throw new ApiError(500,"cant update comment")
  }

  return res.status(200).json(new ApiResponse(200,updatedComment,"Comment updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params

  if (!commentId) {
    throw new ApiError(400,"Comment doesnt exist")
  }
 
  const isAuthorised = await Comment.findOne({
    owner: req.user?._id,
    _id: commentId
  })
  if (!isAuthorised) {
    throw new ApiError(403,"Not authorised to delete comment")
  }
  if (isAuthorised) {
    await Comment.findByIdAndDelete(commentId)
  }

  return res.status(200).json(new ApiResponse(200, {},"Comment deleted successfully"))
})
export {
    addComment,updateComment, deleteComment, getVideoComments
}