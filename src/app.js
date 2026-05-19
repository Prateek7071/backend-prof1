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
export { app }