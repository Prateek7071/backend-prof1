//require('dotenv').config({path: './env'})
// import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
// dotenv.config({
//   path: './env'
// })

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error listening: ", error)
      throw error
    })
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening at port :${process.env.PORT}`);
    } )
  }).catch((err) => {
    console.log("MongoDB connection failed",err)
  })

//approach 1 
// function connect(){}
// connect()
// approach 2 : professional approach 

// the preceeding ; is for cleaning purposes, as maybe the IDE didnt put ; on previous sentence
// ; (() => { })() -> called iffis


//So this is approach 1 to connect to db
/* 

import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express()

(async () => {
  try{ 
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    app.on("error", (error) => {
      console.log("Error: ", error)
      throw error
    })

    app.listen(process.env.PORT, () => {
      console.log(`App is listening on ${process.env.PORT}`)
    })
    
  }catch(error) {
    console.log("error connecting to db: ", error);
    throw error
  }
})()
*/