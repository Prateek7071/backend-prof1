import mongoose from "mongoose";
import { DB_NAME } from "./constants";


//approach 1 
// function connect(){}
// connect()
// approach 2 : professional approach 

// the preceeding ; is for cleaning purposes, as maybe the IDE didnt put ; on previous sentence
// ; (() => { })() -> called iffis


//So this is approach 1 to connect to db
/* 
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