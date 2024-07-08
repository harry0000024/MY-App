// require('dotenv').config({path:'.env'});

import dotenv from 'dotenv'

import connectDB from './db/index.js'
import { app } from './app.js'

dotenv.config({
    path: './.env'
});

 
connectDB()

.then(()=>{
    app.listen(process.env.PORT || 8085,()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    }
    )
})
 .catch((err)=>{

console.log("Mongo db connection failed!!", err);
    })
   
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";


import express from "express";

const app = express();
( async () => {

    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("Error ", (error)=>{
            console.log("Error: ",error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on Port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("ERROR ", error);
        throw error;
    }



})();
*/
