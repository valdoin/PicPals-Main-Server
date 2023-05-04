const Mongoose = require('mongoose')
const { CommentSchema } = require('./Comments') 
const { UserSchema } = require('./User')

const PostSchema = new Mongoose.Schema({
    phrase: String,
    author: { type: Mongoose.Schema.Types.ObjectId, ref: 'Users' },
    date: { type: Date, default: Date.now },
    url: String,
    comments: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
    upvotes: Number,
    
})

const Post = Mongoose.model("Post", PostSchema)
module.exports = Post