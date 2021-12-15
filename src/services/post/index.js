import { Router } from "express"
const routerPost = Router()
import PostModel from "../zmodels/post.js";
import requireLogin from "../../middleware/requireLogin.js"

routerPost.get("/allpost",requireLogin, (req, res) => {
    PostModel.find()
    .populate("postedBy","_id name")
    .populate("comments.postedBy", "_id name pic")
    .sort("-createdAt")
    .then(posts => {
        res.json({posts:posts})
    })
    .catch(err => {
        console.log(err)
    })
})
routerPost.get("/getsubpost",requireLogin, (req, res) => {
    PostModel.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")
    .populate("comments.postedBy", "_id name pic")
    .sort("-createdAt")
    .then(posts => {
        res.json({posts:posts})
    })
    .catch(err => {
        console.log(err)
    })
})
//missiong one here
routerPost.post("/createpost", requireLogin, (req, res) => {
    const {title, body, pic} = req.body
    if(!title || !body || !pic) {
        return res.status(422).json({error:"Please add all the fields"})
    }
    // console.log(req.user)
    // res.send("ok")
    req.user.password = undefined
    req.user.__v = undefined

    const post = new PostModel({
        title:title,
        body:body,
        photo:pic,
        postedBy:req.user
    })
    post.save()
    .then(result => {
        res.json({post:result})
    })
    .catch(err => {
        console.log(err)
    })
})
routerPost.get("/mypost",requireLogin, (req, res) => {
    PostModel.find({postedBy:req.user._id})
    .populate("postedBy", ":id name")
    .then(mypost => {
        res.json({mypost:mypost})
    })
    .catch(err => {
        console.log(err)
    })
})
routerPost.put("/like",requireLogin, (req, res) => {
    PostModel.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },
    {new: true
    })
    .populate("comments.postedBy","_id name pic")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})
routerPost.put("/unlike",requireLogin, (req, res) => {
    PostModel.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },
    {new: true
    })
    .populate("comments.postedBy","_id name pic")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})
routerPost.put("/comment",requireLogin, (req, res) => {
    const comment = {
        text:req.body.text,
        postedBy: req.user._id,
        // pic: req.user.pic
    }
    PostModel.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },
    {new: true
    })
    .populate("comments.postedBy","_id name pic")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
        if(err) {
            return res.status(422).json({error:err})
        } else {
            res.json(result)
        }
    })
})
routerPost.delete("/deletepost/:postId",requireLogin, (req, res) => {
    PostModel.findOne({_id:req.params.postId})
    .populate("postedBy", "_id")
    .exec((err,post) => {
        if(err || !post) {
            return res.status(422).json({error: err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()) {
            post.remove()
            .then(result => {
                res.json(result)
            }).catch(err => console.log(err))
        }
    })
})

export default routerPost