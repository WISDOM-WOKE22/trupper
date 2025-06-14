const express = require('express');
const {
  createExamCategory,
  getAnExamCategory,
  getCategoryByExam,
  removeCategory,
  updateExamCategory,
  getCategoryByExamUser,
} = require('../controllers/examCategory');
const Admin = require('../models/admins')
const { protect } = require('../middlewares/protectRoute')

const Router = express.Router();

Router.route('/').post(protect(Admin),createExamCategory);

Router.route('/exam/:id').get(protect(Admin),getCategoryByExam);

Router.route('/exam_user/:id').get(protect(Admin),getCategoryByExamUser);

Router.route('/remove/:id').post(protect(Admin),removeCategory);

Router.route('/:id').get(getAnExamCategory).patch(updateExamCategory);

module.exports = Router;
