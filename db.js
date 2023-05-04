const Mongoose = require('mongoose')

const localDB = 'mongodb://127.0.0.1:27017/PicPals'

const connectDB = async () => {
    await Mongoose.connect(localDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
    })
    console.log("MongoDB connected")
}

module.exports = connectDB