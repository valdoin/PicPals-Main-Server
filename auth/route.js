const express = require("express")
const router = express.Router()
const { register, login, deleteUser, requestFriend, getFriendList, deleteFriend } = require("./crudUser")
const { createPost, deletePost, getPost, getFriendsPosts } = require("./crudPost")
const { createComment } = require("./crudComments")
const { authenticateUser, authenticateUserBeforePostDelete, postFromFriend, authenticateBeforePost } = require("../middleware/auth")
const initStorage = require('../storage')

upload = initStorage()

//user
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/deleteUser").delete(authenticateUser, deleteUser)

//friends
router.route("/requestFriend").post(requestFriend)
router.route("/getFriendList").get(getFriendList)
router.route("/deleteFriend").delete(deleteFriend)

//post
router.route("/createPost").post(authenticateBeforePost, upload.single('image'), createPost)
router.route("/deletePost").delete(authenticateUserBeforePostDelete, deletePost)
router.route('/getPost').get(getPost)
router.route("/getFriendsPosts").get(getFriendsPosts)


//comments
router.route("/createComment").post(postFromFriend, createComment)




module.exports = router