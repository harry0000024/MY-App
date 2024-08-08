import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";


// below I have created a methode to generate access and refreshToken
const generateAccessAndRefreshToken = async (userId) =>{

    try {
        const user = await User.findById(userId) 
         // it will find user automatically by id then it will generate access and refresh token
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
  

    user.refreshToken = refreshToken
  user.save({validateBeforeSave: false })  
  // here i have set false because it ask password before saving

   return {accessToken, refreshToken}  // saving refresh token in database

    } catch (error) {
        throw new ApiError(500, "Something is wrong while generating refresh and access token")
    }
}




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

const existedUser =  await User.findOne({
    $or:[{username},{email}]
})
if(existedUser){
    throw new ApiError(409,"user with email or password already exits")
}

//here we  have directy access of file because we are using multer. express already gives access of body
const avatarLocalPath = req.files?.avatar[0]?.path;
// const coverImageLocalPath = req.files?.coverImage[0]?.path;

let coverImageLocalPath;
if (req.files && Array.isArray(req.files.coverImage) &&
req.files.coverImage.lenght>0) {
    coverImageLocalPath = req.files.coverImage[0].path
}

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

const createdUser =  await User.findById(user._id).select(
    "-password -refreshToken"
)
if (!createdUser) {
    throw  new ApiError(500, "Something went wrong while registring the user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User has been created Successfully")
)

})

const loginUser = asyncHandler(async(req, res)=>{

    // req body -> data
    //username  or email
    // find the user
    //password check
    // accesss and refresh token
    //send cookies

    const {email, username, password} = req.body

if (!username && !email) {
    throw new ApiError(400, "username  or email is required")
}

 // Here is an alternative of above code based on logic:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

const user = await User.findOne({
    $or:[{username},{email}]
})
if (!user) {
    throw new ApiError(404, "user does not exist")
}

const isPasswordValid = await user.isPasswordCorrect(password)
if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
}



  const {accessToken, refreshToken} =   await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password, -refreshToken")

const options= {
    httpOnly: true,
    secure: true
}
return res
.status(200)
.cookie("accessToken", accessToken, options )
.cookie("refreshToken", refreshToken,options)
.json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)


})
const logoutUser = asyncHandler(async(req,res)=>{
   
    await   User.findByIdAndUpdate(
req.user._id,
{
    $set:{
       refreshToken: undefined
    }
},

{
    new:true
}
       )

       const options= {
        httpOnly: true,
        secure: true
    }
     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options) 
     .json(new ApiResponse(200, {}, "User logged Out"))       
    })


const refreshAccessToken = asyncHandler(async(req, res) => {
 const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

 if (!refreshAccessToken) {
    throw new ApiError(401, "unauthorized request")
 }
 try {
     const decodedToken =  jwt.verify(
       incomingRefreshToken,
       process.env.REFRESH_TOKEN_SECRET
   
   )
   
    const user =  await User.findById(decodedToken?._id)
   if (!user) {
       throw new ApiError(401, "Invalid Refresh Token")
   }
   
   if (incomingRefreshToken !== user?.refreshToken) {
       throw new ApiError(401, "Refresh Token is expired or used")
   }
   
   const options ={
       httpOnly : true,
       secure: true
   }
   
   await generateAccessAndRefreshToken(user._id)
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
       new ApiResponse(
           200,
           {accessToken, refreshToken:
               newRefreshToken
           },
           "Access Token Refreshed"
       )
   )
 } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token")
 }


}
)


const changeCurrentPassword = asyncHandler(async(req, 
    res) =>{
   const {oldPassword, newPassword} = req.body
  
   const user =await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old Password")
   }
   user.password = newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed Successfully"))

})



const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fatched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{

     const{fullname, email}=  req.body

     if(!fullname || !email){
        throw new ApiError(400, "All fields are required")
     }

    const user  = User.findByIdAndUpdate(
        req.user._id,
        {
          $set:{
            fullname,
            email: email
      },
      
        },
        {new:true}
     ).select("-password")

     return  res
     .status(200)
     .json(new ApiResponse(200, user,"Account details updated  Successfully"))
}
)

const updateUserAvatar = asyncHandler(async(req, res) =>{
     const avatarLocalPath = req.file?.path
     if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar  file is missing")
     }

       const avatar=  await uploadOnCloudinary(avatarLocalPath)
        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading avatar")
        }
      
         const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    avatar: avatar.url
                }
            },
            {new:true}
         ).select("-password")
         return res
        .status(200)
        .json(new ApiResponse(200,user,"Avatar Updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) =>{
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
       throw new ApiError(400, "CoverImage file is missing")
    }

      const coverImage=  await uploadOnCloudinary(coverImageLocalPath)
       if (!coverImage.url) {
           throw new ApiError(400, "Error while uploading Cover Image")
       }
     
       const user = await User.findByIdAndUpdate(
           req.user?._id,
           {
               $set:{
                   avatar: avatar.url
               }
           },
           {new:true}
        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,"Cover Image Updated Successfully"))
})


// I have to delete old image : I can  do it by writing a utils for this . by making methos Imageto Dleted , deleteby id

const getUserChannelProfile = asyncHandler(async(req, res)=>{

    const {username} = req.params

    if(!username?.trim){
        throw new ApiError(400, "username is missing")
    }
const channel= await User.aggregate([
    {
$match:{
   username:username?.toLowerCase()
}
},
{
    $lookup:{
        from: "subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"
    }
},
{
    $lookup:{
        from: "subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
    }
},
{
    $addFields:{
        subscribersCount:{
            $size:"subscribers"
        },
        channelsSubscribedToCount:{
            $size:"subscribedTo"
        },
        isSubscribed:{
            $cond:{
                if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                then:true,
                else:false
            }
        }
    }
},
{
    $project:{
        fullname:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1
    }
}
])
if (!channel?.length) {
    throw new ApiError(404, "channel does not exists")
}
return res
.status(200)
.json(
    new ApiResponse(200, channel[0], "User channel fetched successfully")
)
})

const getWatchHistory = asyncHandler(async(req,res)=>{
const user = await User.aggregate([
    {
        $match:{
            _id: new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as: "watchHistory",
            pipeline:[
                {
                    $lookup:{
                          from:"users",
                          localField:"owner",
                          foreignField:"_id",
                          as:"owner",
                          pipeline:[
                            {
                                $project:{
                                    fullname:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                          ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]

        }
    }
])

return res
.status(200)
.json(
    new ApiResponse(200,
        user[0].watchHistory,
        "Watch History fetched successfully"
    )
)



})






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory


}
