import mongoose, {Schema, SchemaType} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {}
)




commentSchema.plugin(mongooseAggregatePaginate)