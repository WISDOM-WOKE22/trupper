const mongoose = require('mongoose');

const waitListSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    organization: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const WaitList = mongoose.model('WaitList', waitListSchema);

module.exports = WaitList;
