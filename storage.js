const multer = require('multer')
const path = require('path')
/*
const checkFileType = function(file, cb) {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = fileTypes.test(file.mimeType)

    if(file){
        if(extName && ){
            return cb(null, true)
        }else{
            cb('error: only images are accepted')
        }
    }else{
        cb('error : no file')
    }
}
*/
function initStorage(filename){
    const storageEngine = multer.diskStorage({
        destination: "./posts/img",
        filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 10000000)
            cb(null, uniqueName + path.extname(file.originalname))
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
              cb(null, true);
            } else {
              cb(null, false);
              return cb(new Error('not an image'));
            }
          }
    });
    
    const upload = multer({ storage: storageEngine, })
    return upload
}

module.exports = initStorage
