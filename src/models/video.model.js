import mongoose, {Schema, SchemaType} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
videofile:{
    type: String,  /// comming from cloudnary
    required: true
},
thumbnail:{
    type: String,  /// comming from cloudnary
    required: true
} ,
tittle:{
    type: String,  /// comming from cloudnary
    required: true
} ,
description:{
    type: String,  /// comming from cloudnary
    required: true
},

duration:{
    type: Number,  /// comming from cloudnary
    required: true
} ,
view:{
    type: Number,  /// comming from cloudnary
    default: 0
} ,
isPublished:{
    type:Boolean,  /// comming from cloudnary
    default:true
} ,
owner:{
    type:Schema.Types.ObjectId,  /// comming from cloudnary
    ref:"User"
}



},
   
    {
        timestamps:true
    }
)


videoSchema.plugin(mongooseAggregatePaginate)

// here plugin is hook


export const Video = mongoose.model("Video", videoSchema)