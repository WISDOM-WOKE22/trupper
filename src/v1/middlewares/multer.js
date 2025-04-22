const Multer = require('multer');
const path = require('path');

const storage = new Multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageFilter = function (req, file, cb) {
  if (!file.mimetype.match(/^image\//)) {
    cb(new Error('Only image files are allowed!'), false);
  } else {
    cb(null, true);
  }
};

const upload = Multer({
  storage,
  fileFilter: imageFilter,
});

module.exports = upload;


