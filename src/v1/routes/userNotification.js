const express = require('express');
const Router = express.Router();
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');

const {
  getNotificationsByUser,
  getANotification,
  markAllAsRead,
} = require('../controllers/userNotification');

Router.use(protect(User));

Router.route('/').get(getNotificationsByUser);
Router.route('/:id').get(getANotification);
Router.route('/mark-all-as-read').post(markAllAsRead);

module.exports = Router;
