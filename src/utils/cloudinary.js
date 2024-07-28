import { v2 as cloudinary} from "cloudinary";
import fs from "fs"     // we have not to install this package it is coming with node  link- https://nodejs.org/api/fs.html#synchronous-example


// import { v2} from 'cloudinary';  // we can give a custom name to ve by  this type. 



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,

        
        // Click 'View Credentials' below to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null

            // upload the file on Cloudinary
const response= cloudinary.uploader.upload(localFilePath, {
    resource_type:"auto"
})

// file has been uploaded successfully
console.log("File has been uploaded on Cloudinary", (await response).url);
return response;

            
        } catch (error) {
            fs.unlinkSync(localFilePath)  //remove the  locally saved temporary file as the upload oparation got faild
            return null;
        }
    }


    export {uploadOnCloudinary}



