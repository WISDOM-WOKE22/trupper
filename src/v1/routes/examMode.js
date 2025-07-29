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

Router.use(protect(Admin));

Router.route('/').post(createExamMode);

Router.route('/:id').patch(updateExamMode).delete(deleteAnExamMode);

Router.route('/sub-category/:id').get(getExamModesBySubCategory);

// Route to manually disable expired active exam modes
Router.route('/disable-expired').post(disableExpiredActiveExamModes);

module.exports = Router;
