const express = require("express")
const bodyParser = require('body-parser')
const multer = require('multer')
const cookieParser = require("cookie-parser");
const connectDB = require("./db")
const initStorage = require("./storage");
const { authenticateBeforeAccessingImg } = require("./middleware/auth");

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  

function generateNextDate(){
    currentDate = new Date()
    nextMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 0, 0, 0)
    max = new Date(nextMidnight.getFullYear(), nextMidnight.getMonth(), nextMidnight.getDate(), 23, 59, 59)
    return currentDate
}


console.log(generateNextDate().toString());


connectDB();
const app = express()

app.use(bodyParser.json())
app.use(cookieParser())


const PORT = 5000
const server = app.listen(PORT, () => console.log(`server listening on port ${PORT}`))

process.on("unhandledRejection", err => {
    console.log(`an error occured: ${err.message}`)
    server.close(() => process.exit(1))
})

app.use('/posts/img',authenticateBeforeAccessingImg ,express.static(__dirname + '/posts/img'))
app.use("/api/auth", require("./auth/route"))

