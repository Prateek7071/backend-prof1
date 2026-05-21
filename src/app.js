import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants";

const app = express() 
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))


app.use(express.json({ limit: {LIMIT} })) //for the case when data filled with form or such and retrieving data using form
app.use(express.urlencoded({ extended: true, limit: { LIMIT } })) // for retrieving data using url
app.use(express.static("public")) // for any public asset we need to store in our server 
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.router.js"

//routes declaration

// app.use()  need to use middleware in place of app.get which we used earlier as we have seperated controller and routers, so use middleware
// app.use("/users", userRouter) use standard practice below
// https://localhost:8000/users -> https://localhost:8000/users/register when user goes to /users it retirects to /users/register

//standard 
app.use("/api/v1/users", userRouter)
// https://localhost:8000/api/v1/users/register

export { app }