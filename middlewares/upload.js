//setup multer
const multer = require('multer');
const uuidv1 = require('uuid/v1');
const storage = multer.diskStorage({
    fileFilter: function (req, file, cb) {
        cb(null, true)
    },
    destination: function (req, file, cb) {
        cb(null, process.env.FILES_BASE);
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv1()}.${file.originalname && file.originalname.substring(file.originalname.lastIndexOf('.') + 1)}`);
    }
});
const fileUploader = multer({storage: storage});

module.exports = {fileUploader};
