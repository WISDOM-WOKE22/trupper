const express = require('express');
const {
  getUsersName,
  updateEmail,
  updateMe,
} = require('../controllers/user');
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');
const { Enable2Fa, disable2Fa } = require('../services/2fa');
const upload = require('../middlewares/multer');

const Router = express.Router();

// Two Factor
Router.route('/enable_2fa').post(protect(User), Enable2Fa(User));
Router.route('/disable_2fa').post(protect(User), disable2Fa(User));

Router.route('/get_users').post(getUsersName);

Router.route('/update_me').post(
  protect(User),
  upload.single('file'),
  updateMe(User)
);

Router.route('/update_email').post(protect(User), updateEmail);

module.exports = Router;
