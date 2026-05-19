import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    // console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance}`) // letting all out to read
    console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`)
    
  } catch (error) {
    console.log("MongoDB connection Failed: ", error);
    // node gives access to process, the current application must be running on some process and this process is the reference to that. and we can use it anywhere we like.
    process.exit(1)
  }
}

export default connectDB