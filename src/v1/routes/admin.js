const express = require('express');
// const { protect } = require('../middlewares/protectRoute');

const { protect } = require('../middlewares/protectRoute');
const {
  getAllAdminsByOrganization,
  getAdminById,
} = require('../controllers/admin');
const Router = express.Router();

Router.route('/organization/:organizationId').get(getAllAdminsByOrganization);
Router.route('/:id').get(getAdminById);

module.exports = Router;
