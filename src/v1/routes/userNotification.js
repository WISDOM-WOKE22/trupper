const express = require('express');
const Router = express.Router();
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');
const Admin = require('../models/admins');

const {
  getNotificationsByUser,
  getANotification,
  markAllAsRead,
} = require('../controllers/userNotification');

Router.route('/').get(protect(User), getNotificationsByUser);
Router.route('/admin').get(protect(Admin), getNotificationsByUser);
Router.route('/:id').get(protect(User), getANotification);
Router.route('/admin/:id').get(protect(Admin), getANotification);
Router.route('/mark-all-as-read').post(protect(User), markAllAsRead);

module.exports = Router;
