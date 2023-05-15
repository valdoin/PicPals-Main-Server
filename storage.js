const multer = require('multer')
const path = require('path')

const checkFileType = function(file, cb) {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = fileTypes.test(file.mimeType)

    if(file){
        if(extName){
            return cb(null, true)
        }else{
            cb('error: only images are accepted')
        }
    }else{
        cb('error : no images')
    }
}

function initStorage(filename){
    const storageEngine = multer.diskStorage({
        destination: "./posts/img",
        filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 10000000)
            cb(null, uniqueName + path.extname(file.originalname))
        },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb)
        }
    });
    
    const upload = multer({ storage: storageEngine, })
    return upload
}

module.exports = initStorage
