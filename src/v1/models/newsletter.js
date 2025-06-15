const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const newsLetterSchema = new Schema(
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
    userType: {
      type: String,
      required: true,
      enum: ['users', 'admins'],
    },
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft',
    },
    queryId: String,
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategory',
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategoryTwo',
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

newsLetterSchema.pre('save', async function (next) {
  this.queryId = await crypto.randomBytes(20).toString('hex');
  next();
});

const newsLetter = mongoose.model('NewsLetter', newsLetterSchema);

module.exports = newsLetter;
