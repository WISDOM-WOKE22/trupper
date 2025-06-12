const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const CategorySubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    },
    active: {
      type: Boolean,
      default: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    examType: {
      type: Schema.Types.ObjectId,
      ref: 'ExamType',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization"
    },
    queryId: String,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

CategorySubjectSchema.pre('save', async function (next) {
  this.queryId = await crypto.randomBytes(20).toString('hex');
  next();
});

const CategorySubject = mongoose.model(
  'CategorySubject',
  CategorySubjectSchema
);

module.exports = CategorySubject;
