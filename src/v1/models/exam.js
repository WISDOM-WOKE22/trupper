const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    acronym: {
      type: String,
      required: true,
      unique: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    examType: {
      type: Schema.Types.ObjectId,
      ref: 'ExamType',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ExamCategory',
    },
    image: String,
    status: {
      type: Boolean,
      default: false,
    },
    pastQuestion: {
      type: Boolean,
      default: true,
    },
    maxNoOfSubjects: Number,
    minNoOfSubjects: Number,
    subjectToBeWritten: {
      type: Number,
      default: 1,
    },
    noOfQuestions: {
      type: Number,
    },
    questionYear: {
      type: Boolean,
      default: false,
    },
    enableOptionE: {
      type: Boolean,
      default: false,
    },
    school: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization"
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "UserCategory"
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "UserCategoryTwo"
    },
    queryId: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
