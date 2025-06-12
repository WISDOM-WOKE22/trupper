const express = require('express');
const {
    createNewsletterAndSaveAsDraft,
  createNewsletterAndSend,
  deleteANewsletter,
  getANewsletter,
  getAllNewsletters,
  sendNewsLetter,
  updateNewsletter,
  getNewsletterByOrganization,
} = require('../controllers/newsletter');
const Router = express.Router();
const { protect } = require('../middlewares/protectRoute')
const Admin = require('../models/admins')

Router.route('/').get(getAllNewsletters);

Router.route('/organization/:organization').get(protect(Admin),getNewsletterByOrganization);

Router.route('/draft').post(protect(Admin),createNewsletterAndSaveAsDraft);
Router.route('/send').post(protect(Admin),createNewsletterAndSend);

Router.route('/send_draft/:id').post(protect(Admin),sendNewsLetter);

Router.route('/:id')
  .delete(deleteANewsletter)
  .get(getANewsletter)
  .patch(updateNewsletter);

module.exports = Router;
