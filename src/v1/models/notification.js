const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    status: {
      type: String,
      enum: ['sent', 'draft'],
      default: 'draft',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    queryId: String,
    userType: {
      type: String,
      enum: ['all', 'admins', 'users'],
      default: 'all',
    },
    userCategory: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategory',
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

notificationSchema.pre('save', async function (next) {
  this.queryId = await crypto.randomBytes(20).toString('hex');
  next();
});

const Notifications = mongoose.model('Notifications', notificationSchema);

module.exports = Notifications;
