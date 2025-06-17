const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examModeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategory',
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'UserCategoryTwo',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
    validTill: Date,
    validFrom: Date,
    queryId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ExamMode = mongoose.model('ExamMode', examModeSchema);

module.exports = ExamMode;
