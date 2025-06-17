const express = require('express');
const {
  getUsersName,
  updateEmail,
  updateMe,
  getAllUsers,
  getUsersByOrganization,
  getAUser,
  unBlockAUser,
  blockAUser,
} = require('../controllers/user');
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');
const Admin = require('../models/admins');
const { Enable2Fa, disable2Fa } = require('../services/2fa');
const upload = require('../middlewares/multer');

const Router = express.Router();

Router.route('/').get(getAllUsers);

// Two Factor
Router.route('/enable-2fa').post(protect(User), Enable2Fa(User));
Router.route('/disable-2fa').post(protect(User), disable2Fa(User));

Router.route('/get_users').post(getUsersName);

Router.route('/get_users_by_organization/:organization').get(
  getUsersByOrganization
);

Router.route('/update-me').post(
  protect(User),
  upload.single('image'),
  updateMe(User)
);

Router.route('/update-admin-me').post(
  protect(Admin),
  upload.single('image'),
  updateMe(Admin)
);

Router.route('/update-email').post(protect(User), updateEmail);

Router.route('/block/:id').patch(blockAUser);
Router.route('/unblocked/:id').patch(unBlockAUser);

Router.route('/:id').get(getAUser);

module.exports = Router;
