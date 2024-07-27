import mongoose, {Schema, Types} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
username:{
       type: String,
       required: true,
        unique: true,
       lowercase: true,
     trim: true,
     index: true

},
email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    },

 fullname:{
        type: String,
        required: true,
         trim: true,
         index: true
        },
avatar:{
            type: String,     // because here it is storing as a id
            required: true,
             
            } ,
coverImage:{
                type: String,     // because here it is storing as a id
                
                 
            },
 watchHistory:[
    {
    type: Schema.Types.ObjectId,
    ref: "video"
 }  
]  ,
password:{
    type: String,
    required: [true, 'Password is required']
} ,

refreshToken:{
    type:String
}

},
{
    timestamps: true
}
)



userSchema.pre("save", async function(next){
if(!this.isModifiend("password")) return next()   // by this line if user has update any another field then password will not change on saving. 

    this.password = await bcrypt.hash(this.password, 10)
    next()

    //     if(this.isModified("password")){
//         this.password = bcrypt.hash(this.password, 10)
// next()
//     }

})
//  here pre is hook


userSchema.method.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function(){
 return jwt.sign(
    //we can return is by  holding in veriable at place of direct return
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname

    },
    process.env.ACCESS_TOKEN_SECRET,    

    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        //we can return is by  holding in veriable at place of direct return
        {
            _id: this._id,
          
        },
        process.env.REFRESH_TOKEN_SECRET,    
    
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)