import multer from 'multer';

const storage = multer.diskStorage({ // saves the files temporarily in the disk
    destination: function (req, file, cb){
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb){ // keep the original name of file
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage
});