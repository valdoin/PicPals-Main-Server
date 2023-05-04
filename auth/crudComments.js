const { Comment } = require("../model/Comments")
const Post = require("../model/Post")
const { User } = require("../model/User")
const jwt = require("jsonwebtoken")
const jwtSecret = require("./jwtVariables")

// crée un post en bd en lien avec l'user connecté
exports.createComment = async (req, res, next) => {
    const { body, postId } = req.body
    const token = req.cookies.jwt

    if (token) {
            //on decode le token afin de recuperer l'utilisateur authentifié
            jwt.verify(token, jwtSecret, (err, decodedToken) => {
                if(err){
                    res.status(401).json({ message: "token error" })
                } 
                else {
                    Comment.create({
                        author: decodedToken.id,
                        body
                    })
                    .then((comment) => {
                        console.log(comment)
                        Post.findById(postId).then((post) => {
                            if(post){
                                post.comments.push(comment)
                                post.save()
                                res.status(201).json({ message: "comment successfully created", comment, postId })
                            }
                            else{
                                res.status(400).json({ message: "no such post" })
                            }
                        })
                        .catch( err => res.status(400).json({ message: "error while fetching post", error: err.message }))
                    })
                    .catch( err => res.status(400).json({ message: "error while creating comment", error: err.message }))
                }
            })
    }
    else{
        res.status(401).json({ message: "no token porvided" })
    }
}