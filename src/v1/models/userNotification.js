const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userNotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notification: {
      type: Schema.Types.ObjectId,
      ref: 'Notifications',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const UserNotification = mongoose.model(
  'UserNotification',
  userNotificationSchema
);

module.exports = UserNotification;
