import mongoose from "mongoose";
const { Schema, model } = mongoose;
const {ObjectId} = Schema.Types

const postSchema = new Schema({
    title: {type:String, required:true},
    body: {type:String, required:true},
    photo: {type:String, required:true},
    likes: [{type: ObjectId, ref:"User"}],
    comments: [{
        text:String,
        pic:{type:String},
        postedBy:{type:ObjectId, ref:"User"}
    }],
    postedBy: {type: ObjectId, ref: "User"}

}, {timestamps:true})

export default model("Post", postSchema)