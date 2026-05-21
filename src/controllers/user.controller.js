import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //cause we never checked if they sent or not and also cause it was not necessary so could be null
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id) // till here finds if user is created or not , below we are selecting and negating what we dont want 
    .select(
      "-password -refreshToken"
  )
  console.log("this is created user : ",createdUser)

  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while creating new user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully!")
  )
})

export { registerUser }