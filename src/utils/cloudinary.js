import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from './ApiError';

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
//TODO: Complete the following method to delete old existing avatar
const deleteFromCloudinary = async(avatarURL) => {
  try { 
    if (!avatarURL) return null;
    //cant get public id from avatarURL, find a way to get that
    const response = await cloudinary.destroy()
  } catch (error) {
    new ApiError(500, error?.message || "Error deleting from cloudinary")
  }
}
export { uploadOnCloudinary }