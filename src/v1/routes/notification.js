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
} = require('../controllers/notification');

Router.use(protect(Admin));

Router.post('/', createNotificationAndSend);
Router.get('/get-by-organization', getNotificationByOrganization);
Router.get('/get-a-notification/:id', getANotification);
Router.put('/update/:id', updateNotification);
Router.delete('/delete/:id', deleteNotification);

module.exports = Router;
