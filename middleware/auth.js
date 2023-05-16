const jwt = require('jsonwebtoken')
const jwtSecret = require('../auth/jwtVariables') 
const Post = require('../model/Post')
const { User } = require('../model/User')

//verifie si le post appartient à l'utilisateur présent dans la signature du cookie
exports.authenticateUserBeforePostDelete = (req, res, next) => {
    const token = req.cookies.jwt
    const { postId } = req.body
    
    Post.findById(postId).then((post) => {
        if (token) {
            jwt.verify(token, jwtSecret, (err, decodedToken) => {
                if(err){
                    return res.status(401).json({ message: "not authorized", error: err.message })
                } 
                //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user authentifié ait pour role 'admin' ou soit l'auteur du post
                else {
                    if(decodedToken.role === "admin" || decodedToken.id === post.author.toString()){
                        next()
                    }
                    else{
                        return res.status(401).json({ message: "not authorized" })
                    }
                }
            })
        }
        else{
            return res.status(401).json({ message: "not authorized, token not available" })
        }
    })
    .catch(err => res.status(400).json({
        message: "error finding post",
        error: err.message
    }))
}

exports.authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt
    const { id } = req.body

    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                return res.status(401).json({ message: "not authorized", error: err.message })
            } 
            //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user authentifié ait pour role 'admin' ou soit le possesseur du compte
            else {
                if(decodedToken.role === "admin" || decodedToken.id === id){
                    next()
                }
                else{
                    return res.status(401).json({ message: "not authorized" })
                }
            }
        })
    }
    else{
        res.status(400).json({ message: "no token provided" })
    }
}

exports.postFromFriend = async (req, res, next) => {
    const token = req.cookies.jwt
    const { postId } = req.body

    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                return res.status(401).json({ message: "not authorized", error: err.message })
            } 
            //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user authentifié ait pour role 'admin' ou que le post appartienne a un de ses amis 
            else {
                User.findById(decodedToken.id)
                    .then((user) => {
                        Post.findById(postId).populate('author')
                            .then((post) => {
                                //verifie que l'on est admin ou que l'auteur du post est notre ami ou nous meme
                                if(decodedToken.role === "admin" || user.friends.includes(post.author._id) || user._id.toString() === post.author._id.toString()) {
                                    next()
                                }
                                else{
                                    return res.status(401).json({ message: "not authorized" })
                                }
                            })
                    })

                
            }
        })
    }
    else{
        res.status(400).json({ message: "no token provided" })
    }

}

exports.authenticateBeforePost = (req, res, next) => {
    const token = req.cookies.jwt

    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                return res.status(401).json({ message: "not authorized", error: err.message })
            } 
            //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user soit authentifié et n'ai pas posté
            else {
                User.findById(decodedToken.id)
                    .then((user) => {
                        if(user){
                            if(!user.posted){
                                next()
                            }
                            else{
                                return res.status(401).json({ message: 'user has already posted today'})
                            }
                        }
                        else{
                            return res.status(401).json({ message: "not authorized"})
                        }

                    })

                
            }
        })
    }
    else{
        res.status(400).json({ message: "no token provided" })
    }
}

exports.authenticateBeforeAccessingImg = async (req, res, next) => {
    const token = req.cookies.jwt
    console.log(token)
    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                return res.status(401).json({ message: "not authorized", error: err.message })
            } 
            //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user soit : l'auteur du post, un ami de l'autheur ou un admin
            else {
                console.log("auth img")
                next()
            }
        })
    }
    else{
        res.status(400).json({ message: "no token provided" })
    }
}

exports.authenticateBeforeGettingHasPosted = async (req, res, next) => {
    const token = req.cookies.jwt
    if(token){
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
            if(err){
                return res.status(401).json({ message: "not authorized", error: err.message })
            } 
            //pour pouvoir passer a l'action suivante (dans les routes), il faut que le l'user soit : l'auteur du post, un ami de l'autheur ou un admin
            else {
                
                User.findById(decodedToken.id).then((user) => {
                    if(user){
                        console.log("auth hasposted")
                        next()
                    }
                    else{
                        return res.status(400).json({message : "could not find user"})
                    }
                })
                .catch((err) => res.status(400).json({message: "error during authentication", error: err.message}))
                
            }
        })
    }
    else{
        res.status(400).json({ message: "no token provided" })
    }
}