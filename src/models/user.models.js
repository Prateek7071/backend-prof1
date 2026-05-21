import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // good to enable this when you know its gonna get searched a lot
  },
  email: {
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

// userSchema.pre(()=>{}) // dont use arrow function here as it does not have reference of this. it doesnt know the context and context here is very important  

// and async cause it takes time
// 
// userSchema(async function (next) {
//   this.password = bcrypt.hash(this.password, 10) //here 10 is the number of rounds
//   next()
// }) at this state it will always run ex, if say user changed avatar it will update the password to so we want it to only do that when we send pasword field

// pre is used to do something just before the data is saved to db
userSchema.pre('save', async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password) //password sent by user, and encrypted password
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id : this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname
    }, // needs a payload
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id : this._id,
    }, // needs a payload, but less compared to access as it gets refresh frequently
    process.env.REFRESH_TOKEN_SECRET, 
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema)