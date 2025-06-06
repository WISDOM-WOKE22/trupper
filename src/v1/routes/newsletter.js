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
const Users = require('../models/users')

Router.route('/').get(getAllNewsletters);

Router.route('/organization/:organization').get(getNewsletterByOrganization);

Router.route('/draft').post(protect(Users),createNewsletterAndSaveAsDraft);
Router.route('/send').post(protect(Users),createNewsletterAndSend);

Router.route('/send_draft/:id').post(protect(Users),sendNewsLetter);

Router.route('/:id')
  .delete(deleteANewsletter)
  .get(getANewsletter)
  .patch(updateNewsletter);

module.exports = Router;
