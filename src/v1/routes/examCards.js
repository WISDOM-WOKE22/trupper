const express = require('express');
const {
  createExamCard,
  deleteExamCard,
  getExamCardSubjects,
  getExamCardByUser,
} = require('../controllers/examCard');
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');

const Router = express.Router();

Router.use(protect(User));

Router.route('/').post(createExamCard).get(getExamCardByUser);

Router.route('/:id').delete(deleteExamCard);

Router.route('/exam/:id').get(getExamCardSubjects);

Router.route('/subject');

module.exports = Router;
