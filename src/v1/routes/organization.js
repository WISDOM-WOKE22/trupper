const express = require('express');
const { protect } = require('../middlewares/protectRoute');
const {
  suspendOrganization,
  createOrganization,
  getAnOrganization,
  getAllOrganizations,
  unsuspendOrganization,
} = require('../controllers/organization');
const Router = express.Router();

Router.route('/create').post(createOrganization);
Router.route('/suspend/:id').post(suspendOrganization);
Router.route('/unsuspend/:id').post(unsuspendOrganization);

Router.route('/').get(getAllOrganizations);
Router.route('/:id').get(getAnOrganization);

module.exports = Router;