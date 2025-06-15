const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      a: String,
      b: String,
      c: String,
      d: String,
      e: String,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    },
    section: String,
    image: String,
    answer: String,
    userAnswer: {
      type: String,
      default: '',
    },
    examtype: {
      type: Schema.Types.ObjectId,
      ref: 'ExamType',
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    solution: String,
    examyear: Number,
    questionNub: Number,
    hasPassage: Boolean,
    category: String,
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    reason: String,
    questionCategory: {
      type: String,
      enum: ['free', 'paid'],
      default: 'paid',
    },
    questionType: {
      type: String,
      enum: ['objective', 'theory', 'sub-objective'],
      default: 'objective',
    },
    queryId: String,
    status: Boolean,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
