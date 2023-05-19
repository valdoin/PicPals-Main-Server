const Post = require("../model/Post")
const { User } = require("../model/User")
const jwt = require("jsonwebtoken")
const jwtSecret = require("./jwtVariables")
const { post, search } = require("./route")
const initStorage = require('../storage')
const { getCurrentPhrase } = require("./crudPhrase")
const { Phrase } = require("../model/Phrase")
const { createHasPostedNotification } = require("./notificationCreator")

// crée un post en bd en lien avec l'user connecté
//une requete contenant un message de succés est renvoyé
exports.createPost = async (req, res, next) => {
    const token = req.cookies.jwt

    if(!req.file){
        return res.status(400).json({message : "no file"})
    }
    if (req.file.mimetype != "image/png" && req.file.mimetype != "image/jpg" && req.file.mimetype != "image/jpeg"){
        return res.status(400).json({ message: "file is not an image"})
    }
    
    if (token) {
            //on decode le token afin de recuperer l'utilisateur authentifié
            jwt.verify(token, jwtSecret, (err, decodedToken) => {
                if(err){
                    res.status(401).json({ message: "token error" })
                } 
                else {
                    userId = decodedToken.id
                }
            })
    }
    else{
        return res.status(401).json({ message: "no token porvided" })
    }

    //on cherche l'user en bd
    try{
        author = await User.findById(userId)
    }
    catch(err){
        return res.status(400).json({
            message: "could not find user",
            error: err.message
        })
    }

    if(author){
        if(!author.posted){
            try{
                currentPhrase = await getCurrentPhrase()
                Post.create({
                    author: author.id,
                    phrase: currentPhrase,
                })
                .then((post)=>{

                    try{
                        post.url = `${req.protocol}://${req.get('host')}/posts/img/${req.file.filename}`
                        post.save()
                    }catch(err){
                        res.status(400).json({
                            message: "could not save post url",
                            error: err.message
                        })
                    }                    

                    try{
                        author.posted = true
                        author.save()
                    }
                    catch(err){
                        res.status(400).json({
                            message: "could not save posting status",
                            error: err.message
                        })
                    }

                    /*createHasPostedNotification(userId)
                    User.findById(userId).then((user) => {
                        User.updateMany({_id: {$in: [user.friends]}}, {$push: {notifications: `hasposted:${userId}`}})
                    })
*/
                    User.findById(id).then((user) => {
                        User.find({_id: {$in: [user.friends]}}).then((friends) => {
                            friends.forEach((friend) => {
                                User.findByIdAndUpdate(friend._id, {$push: {notifications: `hasposted:${userId}`}})
                            })
                        })
                        
                    })
                    res.status(201).json({
                        message: "post successfully created"
                    })
                })
                .catch( (err) => res.status(404).json({ message: "post could not be created", error: err}))
                

            }
            catch (err){
                try{
                    author.posted = false
                    author.save()
                }
                catch(err){
                    return res.status(400).json({
                        message: "could not save posting status",
                        error: err.message
                    })
                }

                return res.status(400).json({
                    message: "could not create post",
                    error: err.message
                })
            }
        }
        else{
            return res.status(400).json({
                message: "user has already posted today"
            })
        }
    }
    else{
        return res.status(400).json({
            message: "user not found"
        })
    }
}

// delete le post d'id 'postId'
//renvoie une requete avec le post
exports.deletePost = async (req, res, next) => {
    const { postId } = req.body
    await Post.findByIdAndDelete(postId)
        .then(post =>{
            if(post){
                res.status(200).json({ message: "post deleted successfully", post})
            }
            else{
                res.status(400).json({
                    message: "no such post"
                })
            }
        })
        .catch(err =>
            res.status(400).json({
                message: "post could not be deleted",
                error: err.message
            }))
}

//
//renvoie une requete contenant un post
exports.getPost = async (req, res, next) => {
    const token = req.cookies.jwt
    const { postId } = req.body
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                //on cherche l'user en bd puis on cherche le post
                User.findById(decodedToken.id).then((user) => {
                    if(decodedToken.role !== "admin"){
                        Post.findOne({
                            author: {$in: [user.friends, user] },
                            _id: postId
                        })
                        .select("-__v")
                        .populate('author', "-friends -friendRequestSent -friendRequestReceived -password -notifications -__v")
                        .then((post) => {
                            res.status(200).json({message: "post successfully fetched", post })
                        })
                        .catch((err) => {
                            res.status(400).json({message: "error while fetching post", error: err.message })
                        })
                }
                else{
                    Post.findById(postId).then((post) => res.status(200).json({ message: "post successfully fetched", post }))
                        .catch((err) => res.status(400).json({message: "error while fetching posts", error: err.message }))
                }
                })
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}

//
//renvoie une requete contenant un tableau de posts
exports.getFriendsPosts = async (req, res, next) => {
    const token = req.cookies.jwt
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, async (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                try{
                    currentPhrase = await Phrase.findById(await getCurrentPhrase());
                }
                catch(err){
                    res.status(400).json({ message: "error", error: err})
                }
                
                console.log("DANS LES POSTS")
                //on cherche l'user en bd puis on cherche dans les posts de ses amis et les siens que l'on tri par date (du plus recent au plus ancien)
                User.findById(decodedToken.id).then((user) => {
                    if(user.friends.length > 0){
                        authorSearch = user.friends.concat(user._id)
                    }
                    else{
                        authorSearch = [user._id]
                    }
                    Post.find({
                        author: {$in: authorSearch },
                        phrase: currentPhrase._id
                    })
                    .select("-phrase -__v")
                    .populate('author', "-friends -friendRequestSent -friendRequestReceived -password -notifications -__v")
                    .sort([['date', -1]])
                    .then((posts) => {
                        res.status(200).json({message: "posts successfully fetched", posts })
                    })
                    .catch((err) => {
                        res.status(400).json({message: "error while fetching posts", error: err.message })
                    })
                })
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}

exports.getUserPosts = (req, res, next) => {
    const token = req.cookies.jwt
    const { phone } = req.body
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, async (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                try{
                    target = await User.findOne({"phone": phone})
                }
                catch(err){
                    res.status(400).json({ message: "error", error: err})
                }
                //on cherche l'user en bd puis on cherche dans les posts de ses amis et les siens que l'on tri par date (du plus recent au plus ancien)
                User.findById(decodedToken.id).then(async (user) => {
                    if(user.id == target._id || user.friends.includes(target._id)){
                        try{
                            targetPosts = await Post.find({author: target._id}).populate("author phrase").sort({_id: -1})
                        }catch(err){
                            return res.status(400).json({message: "could not fetch target posts", error: err.message})
                        }
                        res.status(200).json({message: "posts successfully fetched", posts: targetPosts})
                    }
                    else{
                        return res.status(400).json({message: "target is not a friend nor yourself"})
                    }
                })
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token provided" })
    }
}

exports.getUserColors = (req, res, next) => {
    const token = req.cookies.jwt
    
    if (token) {
        //on decode le token afin de recuperer l'utilisateur authentifié
        jwt.verify(token, jwtSecret, async (err, decodedToken) => {
            if(err){
                res.status(401).json({ message: "token error" })
            } 
            else {
                User.findById(decodedToken.id).then((user) =>
                    res.status(200).json({ primaryColor: user.primaryColor, secondaryColor: user.secondaryColor })
                )
                .catch((err) => {
                    res.status(400).json({ message: "error while finding user", error: err.message })
                })
            }
        })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}