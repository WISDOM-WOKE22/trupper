const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const codeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['authentication', 'exam'],
      default: 'authentication',
    },
    expiresIn: {
      type: Date,
      default: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategory',
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategoryTwo',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'used', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Code = mongoose.model('Code', codeSchema);
module.exports = Code;
