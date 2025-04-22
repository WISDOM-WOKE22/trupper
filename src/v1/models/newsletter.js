const mongoose = require('mongoose');
const crypto = require('crypto');

const newsLetterSchema = new mongoose.Schema(
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
      enum: ['users', 'sales-agents'],
    },
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft',
    },
    queryId: String,
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
