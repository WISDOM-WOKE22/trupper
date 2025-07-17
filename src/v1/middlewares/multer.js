const Multer = require('multer');
const path = require('path');

const storage = new Multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageFilter = function (req, file, cb) {
  // Allow only image and PDF files
  if (file.mimetype.match(/^image\//) || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

const upload = Multer({
  storage,
  fileFilter: imageFilter,
});

module.exports = upload;
