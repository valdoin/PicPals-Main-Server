const express = require("express")
const router = express.Router()
const { register, login, deleteUser, requestFriend } = require("./crudUser")
const { createPost, deletePost, getPost, getFriendPosts } = require("./crudPost")
const { createComment } = require("./crudComments")
const { authenticateUser, authenticateUserBeforePostDelete, postFromFriend } = require("../middleware/auth")

//user
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/deleteUser").delete(authenticateUser, deleteUser)

//friends
router.route("/requestFriend").post(requestFriend)

//post
router.route("/createPost").post(createPost)
router.route("/deletePost").delete(authenticateUserBeforePostDelete, deletePost)
router.route('/getPost').get(getPost)
router.route("/getFriendPosts").get(getFriendPosts)

//comments
router.route("/createComment").post(postFromFriend, createComment)



module.exports = router