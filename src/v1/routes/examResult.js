const express = require('express');
const Router = express.Router();
const {
  getExamModeResultByOrganization,
  getExamModeResult,
} = require('../controllers/examModeResult');
const { protect } = require('../middlewares/protectRoute');
const Admin = require('../models/admins');

Router.route('/:id').get(getExamModeResultByOrganization);
Router.route('/single/:id').get(getExamModeResult);

module.exports = Router;
