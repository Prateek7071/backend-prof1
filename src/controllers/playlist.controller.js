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

export {
  createPlaylist
}