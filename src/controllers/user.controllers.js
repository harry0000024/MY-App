import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const registerUser = asyncHandler(async(req, res)=>{
 
 // get user details from frontend
 // validate not empty
 // check is user already exists: username email
 // check for images and avatars
// upload them to cloudinary, avatar
// create user object - create user in db
// password and refresh token field from response
// check for user creation
// return res
 
 const {fullname, email, username, password}= req.body
console.log("email:", email);

if(
    [fullname,email,username,password].some((field)=>
    field?.trim() === "")
){
    throw new ApiError(400,"All fiends are required")
}

const existedUser = User.findOne({
    $or:[{username},{email}]
})
if(existedUser){
    throw new ApiError(409,"user with email or password already exits")
}

//here we  have directy access of file because we are using multer. express already gives access of body
const avatarLocalPath = req.file?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if (!avatar) {
    throw new ApiError(400,"Avatar file is required")
}


const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

})

const createdUser =  await User.findById(User._id).select(
    "-password -refreshToken"
)
if (!createdUser) {
    throw  new ApiError(500, "Something went wrong while registring the user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User has been created Successfully")
)

})

export {registerUser}
