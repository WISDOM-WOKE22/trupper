const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const examCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    examType: {
      type: Schema.Types.ObjectId,
      ref: 'ExamType',
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CategorySubject',
      },
    ],
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization"
    },
    status: {
      type: Boolean,
    },
    queryId: String,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

examCategorySchema.pre('save', async function (next) {
  this.queryId = await crypto.randomBytes(20).toString('hex');
  next();
});

const ExamCategory = mongoose.model('ExamCategory', examCategorySchema);

module.exports = ExamCategory;
