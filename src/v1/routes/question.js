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
const { generateExamQuestions } = require('../services/ai/generateQuestions');
const { protect } = require('../middlewares/protectRoute');
const Admin = require('../models/admins');

Router.route('/')
  .get(getAllQuestions)
  .post(upload.single('image'), createQuestion);

Router.route('/:id')
  .get(getAQuestion)
  .patch(updateQuestion)
  .delete(deleteAQuestion);

Router.route('/organization/:organization').get(getQuestionsByOrganization);
Router.route('/subject/:subject').get(getQuestionsBySubject);
Router.route('/ai-generate-questions').post(
  protect(Admin),
  upload.array('files', 10),
  generateExamQuestions
);

module.exports = Router;
