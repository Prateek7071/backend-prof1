import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.models.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  if (!(name && description)) {
    throw new ApiError(400, "Name or description required")
  }

  //rather than checking here then creating, just let the db check if duplicate exist it will just throw error

  try {
    const newPlaylist = await Playlist.create({
      name: name,
      description: description,
      owner: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, newPlaylist,"Playlist created"))
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409,"Playlist already exists")
    }
    throw new ApiError(500, "Something went wrong while creating the playlist");
  }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
  const {userId} = req.params

  if (!userId) {
    throw new ApiError(400, "User required")
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $sort: {createdAt:-1}
    },
    {
      $lookup: {
        from: "videos",
        let: {
          video_id: {$arrayElemAt:["$videos",0]}
        },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$video_id"] }
            }
          },
          { $project: { thumbnail: 1 } }
        ],
        as:"firstVideo"
      }
    },
    {
      $facet: {
        metadata: [{ $count: "totalPlaylists" }],
        data: [
          {
            $addFields: {
              videoCount: { $size: "$videos" },
              thumbnail:
              {
                $arrayElemAt: ["$firstVideo.thumbnail", 0]
              }
            }
          },
          {
            $project: {
              name: 1,
              description: 1,
              thumbnail: 1,
              videoCount: 1,
              updatedAt: 1,
              createdAt: 1
            }
          }
        ],
      }
    }
  ])

  // if (userPlaylists.length === 0) {
  //   throw new ApiError(404,"User playlists does not exist")
  // } ONLY FOR FACEIT OUTPUTS: useless as if no playlist it returns one obj with metadata as [] and data []

  const total = userPlaylists[0].metadata[0]?.totalPlaylists || 0
  const data = userPlaylists[0].data
  return res.
    status(200).
    json(new ApiResponse(
      200,{
      totalPlaylists: total,
      data: data
      },
      "User playlist retrieved"))
})

// for now all playlists are public

const getPlaylistById = asyncHandler(async (req, res) => {
  const {playlistId} = req.params
  if (!playlistId) {
    throw new ApiError(400,"Playlist not found")
  }
  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullname: 1
                  }
                }
              ],
              as: "ownerDetails"
            }
          },
          {
            $addFields: {
              owner: { $arrayElemAt: ["$ownerDetails", 0] }
            }
          }
        ]
      }
    },
    {
      $sort:{createdAt: -1}
    },
    {
      $addFields: {
        videoCount: { $size: "$videos" },
        thumbnail: { $arrayElemAt: ["$videoDetails.thumbnail", 0] },
      }
    },
    {
      $project: {
        name: 1,
        description: 1,
        updatedAt: 1,
        videoCount: 1,
        thumbnail: 1,
        videoDetails: {
          title: 1,
          thumbnail: 1,
          duration: 1,
          views: 1,
          owner: {
            username: 1,
            fullname: 1
          },
          updatedAt: 1
        }
      }
    }
  ])

  if (!userPlaylist.length) {
    throw new ApiError(404, "Playlist not found")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist[0],"Playlist retrieved"))
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "Bad request")
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
      $addToSet: {
        videos: videoId
      }
  }, {
    returnDocument: "after"
  }
  )

  if (!playlist) {
    throw new ApiError(404, "Playlist not found")
  }

  return res.status(200).json(new ApiResponse(200, playlist,"Video added to playlist"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "No playlist found");
  }

  if (!(name || description)) {
    throw new ApiError(400, "Name or description required");
  }

  const updateFields = {};

  if (name) updateFields.name = name;
  if (description) updateFields.description = description;

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      owner: req.user?._id,
      _id: playlistId
    },
    {
      $set: updateFields,
    },
    {
      returnDocument: "after",
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Failed to update playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Playlist updated"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "No playlist found");
  }

  // const isAuthorised = await Playlist.findOne({
  //   owner: req.user?._id,
  //   _id: playlistId,
  // });

  // if (!isAuthorised) {
  //   throw new ApiError(403, "Not authorised to delete this playlist");
  // } direclty doing this below

  const deletedPlaylist = await Playlist.findOneAndDelete({
    owner: req.user?._id,
    _id: playlistId
  })

  if (!deletedPlaylist) {
    throw new ApiError(404, "Failed to delete playlist");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted"));
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "Not found");
  }

  const afterRemoved = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user?._id,
    },
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      returnDocument: "after",
    }
  );

  if (!afterRemoved) {
    throw new ApiError(404, "Cant remove video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, afterRemoved, "Video removed from playlist"));
})

export {
  createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, updatePlaylist, deletePlaylist, removeVideoFromPlaylist
}
