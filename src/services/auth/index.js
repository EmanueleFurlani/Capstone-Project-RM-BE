import { Router } from "express"
const routerAuth = Router()
import UserModel from "../zmodels/user.js";
import { randomBytes } from "crypto"
// const bcrypt = require("bcryptjs")
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
// const jwt = require("jsonwebtoken")
// import { JWT_SECRET } from "../keys"
// import requireLogin from "../middleware/requireLogin"
// const nodemailer = require("nodemailer")
// const sendgridTransport = require("nodemailer-sendgrid-transport")
import nodemailer from "nodemailer"
import sendgridTransport from "nodemailer-sendgrid-transport"

// mypass = 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

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{api_key:process.env.API_SENDGRID}
}))

routerAuth.post("/signup", (req, res) => {
    const {name, email, password, pic, description } = req.body
    if(!email || !password || !name){
        return res.status(422).json({error:"please add all the fields"})
    }
    UserModel.findOne({email:email})
    .then((savedUser) => {
        if(savedUser) {
            return res.status(422).json({error:"user already exist with that email"})
        }
        bcrypt.hash(password,12)
        .then(hashedpassword => {
               const user = new UserModel({
            email: email,
            password :hashedpassword,
            name: name,
            pic: pic,
            description: description
        })
        user.save()
        // .then(user => {
        //     transporter.sendMail({
        //         to:user.email,
        //         from:"no-reply@randoMountain.com",
        //         subject:"signup success",
        //         html: "<h1>Welcome to RandoMountain</h1>"
        //     })
        //     res.json({message:"saved successfully"})
        // })
        .then(user => {
            res.json({message:"saved successfully"})
        })
        .catch(err => {
            console.log(err)
        })
        })

    })
    .catch(err => {
        console.log(err)
    })
})
routerAuth.post("/signin", (req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
       return res.status(422).json({error:"please add email or password"})
    }
    UserModel.findOne({email:email})
    .then(savedUser => {
        if(!savedUser) {
          return res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch) {
                // res.json({message:"successfully signed in"})
                const token = jwt.sign({_id:savedUser._id}, process.env.JWT_SECRET)
                const {_id, name, email, followers, following, pic, description} = savedUser
                res.json({token:token, user:{_id, name, email, followers, following, pic, description}})
            }
            else {
                return res.status(422).json({error:"Invalid email password"})
            }
        })
        .catch(err => {
            console.log(err)
        })
    })
})
//check the email route if is correct
routerAuth.post("/reset-password", (req, res) => {
    randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err)
        }
        const token = buffer.toString("hex")
        UserModel.findOne({email:req.body.email})
        .then(user => {
            if(!user) {
                return res.status(422).json({error:"User dont exists with that email"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result) => {
                transporter.sendMail({
                    to:user.email,
                    //must create a new Single Sender for Verification
                    from: "emanuelefurlani.go@gmail.com",
                    subject:"password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>Click in this <a href="http://localhost:3000/reset/${token}">Link</a> to reset password</h5>
                    `
                })
                res.json({message:"check your email"})
            })
        })
    })
})
routerAuth.post("/new-password",(req, res) => {
    const newPassword = req.body.password
    const sentToken = req.body.token
    UserModel.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user => {
        if(!user) {
            return res.status(422).json({error:"Try again session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword => {
            user.password = hashedpassword
            user.resetToken = undefined
            user.expireToken = undefined
            user.save().then((saveduser) => {
                res.json({message: "password update success"})
            })
        })
    }).catch(err => {
        console.log(err)
    })
})

export default routerAuth