const Mongoose = require('mongoose')
const { UserSchema } = require('./User')

const CommentSchema = new Mongoose.Schema({
    author: { type: Mongoose.Schema.Types.ObjectId, ref: 'Users' },
    date: Date,
    body: String
})

const Comment = Mongoose.model("Comments", CommentSchema)
module.exports = { CommentSchema, Comment }