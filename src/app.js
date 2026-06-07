import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants.js";

const app = express() 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))


app.use(express.json({ limit: LIMIT })) //for the case when data filled with form or such and retrieving data using form
app.use(express.urlencoded({ extended: true, limit:  LIMIT  })) // for retrieving data using url
app.use(express.static("public")) // for any public asset we need to store in our server 
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.route.js"

//routes declaration

// app.use()  need to use middleware in place of app.get which we used earlier as we have seperated controller and routers, so use middleware
// app.use("/users", userRouter) use standard practice below
// https://localhost:8000/users -> https://localhost:8000/users/register when user goes to /users it retirects to /users/register

//standard 
app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users/register

import videoRoute from "./routes/video.route.js"
app.use("/api/v1/videos",videoRoute)

import tweetRouter from "./routes/tweet.route.js"
app.use("/api/v1/tweets", tweetRouter)

import healthcheckRouter from "./routes/healthcheck.route.js"
app.use("/api/v1/healthcheck", healthcheckRouter)

import subscriptionRouter from "./routes/subscription.route.js"
app.use("/api/v1/subscriptions", subscriptionRouter)

import commentRouter from "./routes/comment.route.js"
app.use("/api/v1/comments", commentRouter)

import likeRouter from "./routes/like.route.js"
app.use("/api/v1/likes", likeRouter)

import playlistRouter from "./routes/playlist.route.js"
app.use("/api/v1/playlists", playlistRouter)

import dashboardRouter from "./routes/dashboard.route.js"
app.use("/api/v1/dashboard", dashboardRouter)


export { app }