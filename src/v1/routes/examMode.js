const express = require('express');
const Router = express.Router();
const { protect } = require('../middlewares/protectRoute');
const Admin = require('../models/admins');
const User = require('../models/users');
const {
  createExamMode,
  deleteAnExamMode,
  getExamModesBySubCategory,
  getExamModesBySubCategoryUser,
  updateExamMode,
  disableExpiredActiveExamModes,
} = require('../controllers/examMode');

Router.route('/sub-category-user').get(
  protect(User),
  getExamModesBySubCategoryUser
);

Router.route('/').post(protect(Admin), createExamMode);

Router.route('/:id')
  .patch(protect(Admin), updateExamMode)
  .delete(protect(Admin), deleteAnExamMode);

Router.route('/sub-category/:id').get(getExamModesBySubCategory);

// Route to manually disable expired active exam modes
Router.route('/disable-expired').post(
  protect(Admin),
  disableExpiredActiveExamModes
);

module.exports = Router;
