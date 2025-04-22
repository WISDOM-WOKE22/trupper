const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: Boolean,
      default: false,
    },
    queryId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
const UserCategory = mongoose.model('UserCategory', userCategorySchema);
module.exports = UserCategory;
