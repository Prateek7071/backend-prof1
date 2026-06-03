import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Playlist } from "../models/playlist.models.js"
import mongoose from "mongoose"

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
      $facet: {
        metadata: [{ $count: "totalPlaylists" }],
        data: [
          {
            $addFields: {
              videoCount: { $size: "$videos" },
              thumbnail:
              {
                $arrayElemAt: ["$videos.thumbnail", 0]
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
  // } useless as if no playlist it returns one obj with metadata as [] and data []
  
  const total = userPlaylists[0].metadata[0]?.totalPlayLists || 0
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
      $facet: {
        metadata: [
          {
            $addFields: {
              videoCount: { $size: "$videos" },
              thumnail: {$arrayElemAt: ["$videos.thumbnail",0]}
            }
          },
          {
            $porject: {
              name: 1,
              description: 1,
              updatedAt: 1,
              videoCount: 1,
              thumbnail: 1
            }
          }
        ],
        data: [
          {
            $addFields: {
              videoDetails: [
                {
                  $lookup: {
                    from: "videos",
                    localField: "videos",
                    foreignField: "_id",
                    as: "videoDetails"
                  }
                },
                {
                  $project: {
                    thumbnail: 1,
                    title: 1,
                    duration: 1,
                    views: 1,
                    owner: 1,
                    published: "$videos.updatedAt"
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ])
  const aboutPlaylist = userPlaylist[0].metadata[0]
  const videoDetails = userPlaylist[0].data

  return res.status(200).json(new ApiResponse(200, {
    about: aboutPlaylist,
    videos: videoDetails
  },
  "Playlist retrieved"))
})


export {
  createPlaylist, getUserPlaylists, getPlaylistById
}