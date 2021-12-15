import mongoose from "mongoose";
const { Schema, model } = mongoose;
const {ObjectId} = Schema.Types

const userSchema = new Schema({
    name:{type:String, required: true},
    email:{type:String, required: true},
    password:{type:String, required: true},
    description:{type:String,},
    resetToken: String,
    expireToken: Date,
    pic:{type:String, default:"https://res.cloudinary.com/dqffc0h5e/image/upload/v1638822616/8-87422_alien-comments-alien-avatar-red_z52rwh.jpg"},
    followers:[{type:ObjectId, ref:"User"}],
    following:[{type:ObjectId, ref:"User"}]
})

export default model("User",userSchema)