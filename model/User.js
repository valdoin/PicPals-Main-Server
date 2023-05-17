const Mongoose = require('mongoose')

const UserSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    phone: {
        type: String,
        unique: true,
        maxlength: 15,
        required: true,
    },

    password: {
        type: String,
        minlength: 6,
        required: true,
    },

    role: {
        type: String,
        default: "user",
        required: true,
    },

    posted: {
        type: Boolean,
        required: true,
        default: false,
    },
    
    friends: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    friendRequestSent: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Users' }],
    friendRequestReceived: [{ type: Mongoose.Schema.Types.ObjectId, ref: 'Users' }],

    notifications:[{type: String}],

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


const User = Mongoose.model("Users", UserSchema)
module.exports = { UserSchema, User }