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
    user:{
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['read', 'unread'],
      default: 'read',
    },
    queryId: String,
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
