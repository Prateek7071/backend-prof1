import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError.js';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
  try { 
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    // console.log("File uploaded to cloudinary successfully, ", response.url)
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath) // removes the locally saved temp file as the upload operation got failed
    console.log("failed to upload on cloudinary, ", error)
    return null;
  }
}

const uploadVideoOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(
      localFilePath, {
        resource_type: "video"
      }
    )
    fs.unlinkSync(localFilePath)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)
    throw new ApiError(400, error?.message || "Cant find the video file to uplaod")
  }
}


//TODO: Complete the following method to delete old existing avatar
const deleteFromCloudinary = async(publicId) => {
  try { 
    if (!publicId) return null;
    //cant get public id from avatarURL, find a way to get that
    const response = await cloudinary.destroy(publicId)
    return response
  } catch (error) {
    new ApiError(500, error?.message || "Error deleting from cloudinary")
  }
}


export { uploadOnCloudinary, uploadVideoOnCloudinary,deleteFromCloudinary }