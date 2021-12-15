import mongoose from "mongoose";
const { Schema, model } = mongoose;

const adventureSchema = new Schema({
    name: {type:String, required:true},
    color: {type:String, required:true},
    photo: {type:String, required:true},
    description: {type:String, required:true},
    length: {type:Number, required:true},
    difficulty: {type:String, required:true},
    via_ferrata: {type:Boolean, required:true},
    max: {type:Number, required:true}

}, {timestamps:true})

export default model("Adventure", adventureSchema)