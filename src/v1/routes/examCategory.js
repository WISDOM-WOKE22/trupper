const express = require('express');
const {
  createExamCategory,
  getAnExamCategory,
  getCategoryByExam,
  removeCategory,
  updateExamCategory,
  getCategoryByExamUser,
} = require('../controllers/examCategory');

const Router = express.Router();

Router.route('/').post(createExamCategory);

Router.route('/exam/:id').get(getCategoryByExam);

Router.route('/exam_user/:id').get(getCategoryByExamUser);

Router.route('/remove/:id').post(removeCategory);

Router.route('/:id').get(getAnExamCategory).patch(updateExamCategory);

module.exports = Router;
