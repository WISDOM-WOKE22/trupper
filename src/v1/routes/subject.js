const express = require('express');
const {
  createSubject,
  getASubject,
  getSubjectsByExam,
  updateSubject,
  deleteSubject,
} = require('../controllers/subject');
const Router = express.Router();

Router.route('/').post(createSubject);
Router.route('/:id')
  .get(getASubject)
  .patch(updateSubject)
  .delete(deleteSubject);
Router.route('/exam/:id').get(getSubjectsByExam);

module.exports = Router;
