import mongoose, {Schema, Types} from "mongoose";

const subscriptionSchema = new Schema({
 subscriber:{
    type: Schema.Types.ObjectId, // One eho is subscribing
    ref:"User"
 },
 channel:{
    type: Schema.Types.ObjectId, // One to whome 'subscriber is subscribing
    ref:"User"
 }
  
}, {timestamps: true})


export const Subscription =  mongoose.model("Subscription", subscriptionSchema)