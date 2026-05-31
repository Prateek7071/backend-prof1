import mongoose, { Schema } from "mongoose";

const subscriptionSchema =new Schema({
  subscriber: {
    type: Schema.Types.ObjectId, //one who's subscribing 
    ref: "User",
    required: true
  },
  channel: {
    type: Schema.Types.ObjectId, //one who subs are subscribing to
    ref: "User",
    required: true
  }
  
}, { timestamps: true })

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)