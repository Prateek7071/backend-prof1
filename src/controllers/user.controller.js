import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId)=>{
  try { 

    const user = await User.findOne(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    // console.log("generateART: ",refreshToken)
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500,error?.message || "Something went wrnong when generate Access And Referesh Tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: "ok"
  // })
  //steps to register user 
  // get user details from frontend
  // validate : first if the fields are not null then other parameters
  // check if user already exists or not : using username or email
  // check for images , check for avatar if the file exist
  // upload them to cloudinary
  // create user object - create entry in db
  // remove password and refresh token from response
  // check for user creation (basically the response )
  // return res

  const { fullname, email, username, password } = req.body
  // console.log("Fullname: ",fullname)
  // console.log("email: ",email)
  // console.log("username: ", username)
  // console.log("Password", password)

  console.log("req.body", req.body)
  // if (fullname === "") {
  //   throw new ApiError(400, "Fullname is required")
  // } this is for those who are learning else can use this

  if (
    [fullname, email, username, password].some((field)=>field?.trim()=== "")
  ) {
    throw new ApiError(400, "All fields are required")
  }

  const existedUser =await User.findOne({ //finds the first entry that exist 
    $or: [{ username }, { email }]
  })

  if (existedUser) {
    throw new ApiError(409, "User already exists ")
  }
  console.table(req.files)
  const avatarLocalPath = req.files?.avatar[0]?.path //multer provides with req.files like how we get req.body
  // const coverImageLocalPath = req.files?.coverImage[0]?.path //this throws error

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }

  if (!avatarLocalPath) {
    throw new ApiError(400,"avatar file is required")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath) //will take time so await
  const coverImage = await uploadOnCloudinary(coverImageLocalPath) //will take time so await

  if (!avatar) {
    throw new ApiError(400,"avatar file is required")
  }

  const user = await User.create({
    fullname,
    avatar: avatar.secure_url,
    avatarPublicId: avatar.public_id,
    coverImage: coverImage?.secure_url || "", //cause we never checked if they sent or not and also cause it was not necessary so could be null
    coverPublicId: coverImage?.public_id || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id) // till here finds if user is created or not , below we are selecting and negating what we dont want 
    .select(
      "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while creating new user")
  }
  console.log("this is created user : ",createdUser)


  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully!")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  //TODO:
  //  req body : get data
  //  check if username or email is there
  //  find username if exist (or email when email based)
  //  validate using password
  //  generate access and refresh token
  //  send secure cookies
  //  send response

  const { email, password, username } = req.body

  if (!username && !email) {
    throw new ApiError("400", "username or email required")
  }

  //alternatively can use (!(username||email))

  const user = await User.findOne({
    $or : [{username},{email}]
  })

  if (!user) {
    throw new ApiError(404,"User doesnt exist please create account!")
  }

  const isPasswordValid =await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id) // this changed access token so the one generated at the start of this function needs to be updated

  // here we can do a db db query if this is not espensive for us else update it from object.
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const option = {
    httpOnly: true,
    secure : true
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken // here sending refresh and access t for maybe the user wants to save them or for mobile where cookie not accessable. this is not the best practicce to send cookie in json but works for the purpose here
      }, " User Logged in Successfully")
    )
  
})

const logoutUser = asyncHandler(async (req, res) => {
  //now we have access to req.user coming from routing (from middleware)

  //using new way to udpdate directly compared to finding user then updating then using validatebeforeSave false,,

  await User.findByIdAndUpdate(req.user._id,    //dont necessary need something in return here
  {  
    $set: {
      refreshToken : undefined 
  },
  },
    {
    //new: true //deprecated 
    returnDocument: 'after' // return mai jo response milega usme new updated value milegi
    }
  )

  const option = {
    httpOnly: true,
    secure : true
  }

  return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken //the latter for mobile devices where token could have been sent via body

  if (!incomingRefreshToken) { 
    throw new ApiError(401, "Unauthorized request")
  }
  
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id)
  
    if (!user) {
      throw new ApiError(401,"Invalid refresh token")
    }
    console.log("-----------------------------------")
    console.log("incoming: ", incomingRefreshToken);
    console.log("decoded: ", decodedToken);
    console.log("db: ", user?.refreshToken);
    console.log("-----------------------------------")
    if (incomingRefreshToken !== user?.refreshToken) { 
      throw new ApiError(401, "refresh token is expired or used")
    }
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user?._id)
    // console.log("NAT: ",accessToken)
    console.log("NRT: ",newRefreshToken)
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json( //TODO: fix refresh token not in response
        200,
        {accessToken,newRefreshToken},
        "Access Token refreshed"
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "error refreshing access token")
  }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword, confirmNewPassword } = req.body

  if (!newPassword || !oldPassword || !confirmNewPassword) {
    throw new ApiError(400, "password not found")
  }
  
  if (!(newPassword === confirmNewPassword)) {
    throw new ApiError(400, "new password mismatch")
  }
  try { 
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await isPasswordCorrect(oldPassword)
  
    if (!isPasswordCorrect) {
      throw new ApiError(400, "invalid old password")
    }
  
    user.password = newPassword;
    await user.save({ validateBeforeSave: false }) // when we do this the pre runs in user.model
  
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password changed successfully"))
  
  } catch (error) {
    throw new ApiError(400,error?.message || "error changing password")
  }
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body
  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required!")
  }
  const user =await  User.findByIdAndUpdate(req.user?._id, {
    $set: {
      fullname, //can also do username: username and for email too
      email
    }
  },
    {
    returnDocument: 'after'
    }
  ).select("-password")
  // TODO: add other things to update
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Fullname changed successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing")
  }

  try {
    const avatar = await uploadOnCloudinary(avatarLocalPath) //careful returns complete object and not just the string
  
    if (!avatar) {
      throw new ApiError("Error uploading avatar on cloudinary ")
    }
  
    const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        avatar: avatar.secure_url,
        avatarPublicId: avatar.public_id
     } 
    }, {
      returnDocument: 'after'
    }).select("-password")
    
    // TODO : delete the old existing avatar image 
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to update avatar")
  }
})

const updateUserCover = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path

  if (!coverLocalPath) {
    throw new ApiError(400, "Cover file is missing")
  }

  try {
    const coverImage = await uploadOnCloudinary(coverLocalPath) //careful returns complete object and not just the string
  
    if (!coverImage) {
      throw new ApiError("Error uploading cover image on cloudinary ")
    }
  
    const user = await User.findByIdAndUpdate(req.user?._id, {
      $set: {
        coverImage: coverImage.secure_url,
        coverPublicId: coverImage.public_id
     } 
    }, {
      returnDocument: 'after'
    }).select("-password")
    return res
      .status(200)
      .json(new ApiResponse(200, user, "Cover image updated successfully"))
  } catch (error) {
    throw new ApiError(401, error?.message || "Failed to update cover image")
  }
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params //using the link to extract username

  if (!username?.trim()) {
    throw new ApiError(400,"username is missing")
  }
  // User.find(username) rather than finidng user like that then perform doing all that operations, do direcrtly from finding user in db to performing action.
  const channel = await User.aggregate([
  
    {
      $match: {
        username: username?.toLowerCase() //here we got the document from user collection with the same username, say Fern (got one document and on the basis of that we need to do lookup to subscription collection)
      }
    },
    
    {
      $lookup: {
        from: "subscriptions", //go to subscriber collection
        localField: "_id",     //get id from the document aquired at previous stage say id=fern123
        foreignField: "channel", //look for all documents with channel which contains = fern123
        as: "subscribers" // will add a field named subscribers with array of objects from subscription model ex({_id, subscriber, channel, createdAt, upadatedAt})
      }
    },
    // at this point we have a document with all the user data(only one user with username fern123) and a field added called subscriber: [{}...]
    {
      $lookup: {
         from: "subscriptions", //go to subscriber collection
         localField: "_id",
         foreignField: "subscriber", //look for all the documents where subscriber: fern123
        as: "subscriberedTo"
      }
    },
    // at this point we have a document with all the user data(only one user with username fern123) and 2 fields added called subscriber: [{}...] and subscribedTo:[{},{}]
    {
      $addFields: {
        subscribersCount: {
          $size:"$subscribers"
        },
        channelsSubscribedTo: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //present in or not
            then: true,
            else: false
          }
        }
      }
    },

    //added three more fields, subscribersCount,channelsSubscribedTo,isSubscribed
    
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedTo: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
      //here just projecting the output 
  ])
  // returns an array with objects channel=[{id, fullname,username,subscribersCount ...}]
  if (!channel?.length) {
    throw new ApiError(404, "Channel doesnt exist")
  }
  
  console.log("-------------------")
  console.log("channel: ", channel);
  console.log("-------------------")

  return res
    .status(200)
    .json(
      new ApiResponse(200,channel[0],"User channel fetched successfully!")
    )
})

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // _id : req.user?._id // this is a bug as it tries to match string (req.user._id) with objectId 
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",

        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",

              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
        
      }
    }
  ])

  return res
    .status(200)
    .json(new ApiResponse(200,user[0].watchHistory, "watch history fetched successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCover,
  getUserChannelProfile,
  getWatchHistory
}
