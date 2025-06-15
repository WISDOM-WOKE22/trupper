const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    exams: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
      },
    ],
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    status: {
      type: Boolean,
      default: false,
    },
    pastQuestion: {
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
    queryId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const ExamType = mongoose.model('ExamType', examTypeSchema);

module.exports = ExamType;
