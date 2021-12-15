import { Router } from "express"
const routerAdventure = Router()
import adventureModel from "./schema.js";
import requireLogin from "../../middleware/requireLogin.js"

routerAdventure.post("/hike", (req, res) => {
    const {name, color, photo, description, length, difficulty, via_ferrata, max} = req.body
    if( !name || !color || !photo || !description || !length || !difficulty || via_ferrata == undefined || !max) {
        return res.status(422).json({error:"Please add all the fieldsss"})
    }

    const post = new adventureModel(req.body)
    post.save()
    .then(result => {
        res.json({hike:result})
    })
    .catch(err => {
        console.log(err)
    })
})

routerAdventure.get("/allhike",requireLogin, (req, res) => {
    adventureModel.find()
    .sort("-createdAt")
    .then(posts => {
        res.json({hike:posts})
    })
    .catch(err => {
        console.log(err)
    })
})

export default routerAdventure