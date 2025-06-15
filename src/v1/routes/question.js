const express = require('express');
const {
  createQuestion,
  deleteAQuestion,
  getAQuestion,
  getAllQuestions,
  getQuestionsByOrganization,
  getQuestionsBySubject,
  updateQuestion,
} = require('../controllers/questions');
const Router = express.Router();
const upload = require('../middlewares/multer');

Router.route('/')
  .get(getAllQuestions)
  .post(upload.single('image'), createQuestion);

Router.route('/:id')
  .get(getAQuestion)
  .patch(updateQuestion)
  .delete(deleteAQuestion);

Router.route('/organization/:organization').get(getQuestionsByOrganization);
Router.route('/subject/:subject').get(getQuestionsBySubject);

module.exports = Router;
