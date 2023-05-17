const Mongoose = require('mongoose')
const { CommentSchema } = require('./Comments') 
const { UserSchema } = require('./User')
const { PhraseSchema } = require('./Phrase')
const { getCurrentPhrase } = require('../auth/crudPhrase')

const PostSchema = new Mongoose.Schema({
    phrase: {type: Mongoose.Schema.Types.ObjectId, ref: 'Phrases'},
    author: { type: Mongoose.Schema.Types.ObjectId, ref: 'Users' },
    date: { type: Date, default: Date.now },
    url: String,
    comments: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Comments' }],
    upvotes: Number,
    
    primaryColor: {
        type: String,
        default: "#0d1b2a",
        maxlength: 8,
    },
    secondaryColor: {
        type: String,
        default: "#1b263b",
        maxlength: 8,
    }
})

const Post = Mongoose.model("Posts", PostSchema)
module.exports = Post