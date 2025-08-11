const UserNotification = require('../models/userNotification');
const { goodResponseDoc, badResponse } = require('../utils/response');

exports.getNotificationsByUser = async (req, res, next) => {
  try {
    const user = req.user;
    const notifications = await UserNotification.find({
      user: user.id,
    }).populate('notification');
    goodResponseDoc(
      res,
      'Notifications fetched successfully',
      200,
      notifications
    );
  } catch (error) {
    next(error);
  }
};

exports.getANotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await UserNotification.findByIdAndUpdate(
      { _id: id },
      { $set: { isRead: true } },
      { new: true, runValidators: false }
    );
    if (!notification) return badResponse(res, 'Notification not found');
    goodResponseDoc(
      res,
      'Notification fetched successfully',
      200,
      notification
    );
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const user = req.user;
    const notifications = await UserNotification.updateMany(
      { user: user.id },
      { $set: { isRead: true } },
      { new: true, runValidators: false }
    );
    goodResponseDoc(
      res,
      'All notifications marked as read',
      200,
      notifications
    );
  } catch (error) {
    next(error);
  }
};
