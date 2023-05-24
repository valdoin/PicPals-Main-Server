const express = require("express")
const router = express.Router()
const { register, login, deleteUser, requestFriend, getFriendList, deleteFriend, getHasPosted, getFriendsRequests, getNotifications } = require("./crudUser")
const { createPost, deletePost, getPost, getFriendsPosts, getUserPosts } = require("./crudPost")
const { createComment } = require("./crudComments")
const { authenticateUser, authenticateUserBeforePostDelete, postFromFriend, authenticateBeforePost, authenticateBeforeGettingHasPosted } = require("../middleware/auth")
const initStorage = require('../storage')
const { getCurrentPhrase, getPhrase } = require("./crudPhrase")

upload = initStorage()

//user
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/deleteUser").delete(deleteUser)
router.route("/getHasPosted").get(authenticateBeforeGettingHasPosted, getHasPosted)
router.route("/getFriendsRequests").get(getFriendsRequests)
router.route("/getNotifications").get(getNotifications)

//friends
router.route("/requestFriend").post(requestFriend)
router.route("/getFriendList").get(getFriendList)
router.route("/deleteFriend").delete(deleteFriend)

//post
router.route("/createPost").post(authenticateBeforePost, upload.single('image'), createPost)
router.route("/deletePost").delete(authenticateUserBeforePostDelete, deletePost)
router.route('/getPost').post(getPost)
router.route("/getFriendsPosts").get(getFriendsPosts)
router.route("/getUserPosts").post(getUserPosts)

//phrase
router.route("/getPhrase").get(getPhrase)


//comments
router.route("/createComment").post(postFromFriend, createComment)




module.exports = router