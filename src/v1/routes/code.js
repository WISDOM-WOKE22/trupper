const express = require('express');
const {
  generateBulkCodes,
  generateSingleCode,
  getAllOrganizationCodes,
  deleteACode,
  getACode,
} = require('../controllers/code');

const Router = express.Router();

Router.route('/generate-single-code').post(generateSingleCode);
Router.route('/generate-bulk-code').post(generateBulkCodes);
Router.route('/organization/:organizationId').get(getAllOrganizationCodes);
Router.route('/:id').get(getACode).delete(deleteACode);

module.exports = Router;
