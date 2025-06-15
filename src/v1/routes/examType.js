const express = require('express');
const {
  createExamType,
  deleteExamType,
  getAnExamType,
  getExamTypeByCategory,
  getExamTypeByOrganization,
  getExamTypeBySubCategory,
  updateExamType,
} = require('../controllers/examTypes');
const Router = express.Router();

Router.route('/organization/:organization').get(getExamTypeByOrganization);

Router.route('/category/:category').get(getExamTypeByCategory);

Router.route('/sub_category/:subCategory').get(getExamTypeBySubCategory);

Router.route('/:id')
  .get(getAnExamType)
  .delete(deleteExamType)
  .patch(updateExamType);

Router.route('/').post(createExamType);

module.exports = Router;
