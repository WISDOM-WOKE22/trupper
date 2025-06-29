const express = require('express');
const {
  createExam,
  getExamsByOrganization,
  updateExam,
  getAnExam,
  deleteAnExam,
  getExamsByOrganizationUser,
  getExamsByExamType,
  startAnExam,
  endExam,
} = require('../controllers/exam');
const User = require('../models/users');
const Router = express.Router();
const upload = require('../middlewares/multer');
const { protect } = require('../middlewares/protectRoute');

Router.route('/').post(upload.single('image'), createExam);
Router.route('/organization-user/:organization').get(
  protect(User),
  getExamsByOrganizationUser
);
Router.route('/organization/:organization').get(getExamsByOrganization);
Router.route('/exam-type/:examType').get(getExamsByExamType);
// Start and end exam (protected)
Router.route('/start-exam/:id').post(protect(User), startAnExam);

Router.route('/end-exam/:id').post(protect(User), endExam);
Router.route('/:id')
  .get(getAnExam)
  .patch(upload.single('image'), updateExam)
  .delete(deleteAnExam);

module.exports = Router;
