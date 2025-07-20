const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examModeCardSchema = new Schema(
  {
    examMode: {
      type: Schema.Types.ObjectId,
      ref: 'ExamMode',
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    result: {
      type: Schema.Types.ObjectId,
      ref: 'ExamModeResult',
    },
    searchCode: String,
    queryId: String,
    expires: Date,
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('ExamModeCard', examModeCardSchema);
