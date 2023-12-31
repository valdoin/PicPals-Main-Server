const express = require("express")
const bodyParser = require('body-parser')
const multer = require('multer')
const cookieParser = require("cookie-parser");
const connectDB = require("./db")
const initStorage = require("./storage");
const { authenticateBeforeAccessingImg } = require("./middleware/auth");
const { createTimeToPostNotification, deleteAllNotifications, createHasPostedNotification } = require("./auth/notificationCreator");




connectDB()

const app = express()

app.use(bodyParser.json())
app.use(cookieParser())


const PORT = 5000
const server = app.listen(PORT, () => console.log(`server listening on port ${PORT}`))

process.on("unhandledRejection", err => {
    console.log(`an error occured: ${err.message}`)
    server.close(() => process.exit(1))
})

app.use('/posts/img',/*authenticateBeforeAccessingImg,*/express.static(__dirname + '/posts/img'))
app.use("/api/auth", require("./auth/route"))

