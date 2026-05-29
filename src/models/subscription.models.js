import mongoose, { Schema } from "mongoose";

const subscriptionSchema = Schema({
  subscriber: {
    type: Schema.Types.ObjectId, //one who's subscribing 
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId, //one who subs are subscribing to
    ref: "User"
  }
  
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)