import mongoose, { Schema } from "mongoose"

const videoSchema = new Schema({
  videoFile: {
    type: String, //cloudnart url
    required: [true, "Provide a video"]
  },
  thumbnail: {
    type: String, //cloudnart url
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true })

export const Video = mongoose.model("Video", videoSchema)