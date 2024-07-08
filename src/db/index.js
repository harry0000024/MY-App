import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectDB = async ()=> {
    try {
      const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Host:${connectionInstance.connection.host}`)
         // this DB Host is for indentification for server. bacause there are different server for different work. It help us to identify that we are connecting with database server.
    } catch (error) {
        console.log("MongoDB connection Failed", error);
        process.exit(1);
        // this exit code used to show exit resion from database
    }
}




export default connectDB