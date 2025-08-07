const express = require('express');
const Router = express.Router();
const { protect } = require('../middlewares/protectRoute');
const Admin = require('../models/admins');

const {
  createNotificationAndSend,
  getNotificationByOrganization,
  getANotification,
  updateNotification,
  deleteNotification,
  getAllNotifications,
  createNotificationAndSaveAsDraft,
  sendNotification,
} = require('../controllers/notification');

Router.use(protect(Admin));

Router.route('/').get(getAllNotifications);
Router.route('/create-and-send').post(createNotificationAndSend);

Router.route('/draft').post(createNotificationAndSaveAsDraft);

Router.route('/send/:id').post(sendNotification);

Router.route('/get-by-organization/:organization').get(
  getNotificationByOrganization
);
Router.route('/get-a-notification/:id').get(getANotification);

Router.route('/:id').put(updateNotification).delete(deleteNotification);

module.exports = Router;
