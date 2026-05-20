import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // good to enable this when you know its gonna get searched a lot
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
    index: true 
  },
  avatar: {
    type: String, //using cloudnary url
    required: true,
  },
  coverImage: {
    type: String, //coudnary url
  },
  watchHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  password: {
    type: String,
    required: [true,"Password is required"]
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true })

export const User = mongoose.model("User", userSchema)