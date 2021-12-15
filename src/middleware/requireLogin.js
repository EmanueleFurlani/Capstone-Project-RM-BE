// const jwt = require("jsonwebtoken")
// import { JWT_SECRET } from "../keys"
// import { model } from "mongoose"
// const User = model("User")
import jwt from "jsonwebtoken"
import UserModel from "../services/zmodels/user.js";


export default (req, res, next) => {
    const {authorization} = req.headers
    // console.log("reqyser check", req.headers)
    if(!authorization) {
        res.status(401).json({error:"you musssst be logged in"})
    }
    const token = authorization.replace("Bearer ","")
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if(err) {
           return res.status(401).json({error: "you must beeee logged in"})
        }
        const {_id} = payload
        UserModel.findById(_id).then(userdata => {
            req.user = userdata
            next()
        })
    
    })
}