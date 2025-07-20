const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examModeResultSchema = new Schema(
  {
    examMode: {
      type: Schema.Types.ObjectId,
      ref: 'ExamMode',
      required: true,
    },
    examModeUsed: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    examModeCard: {
      type: Schema.Types.ObjectId,
      ref: 'ExamModeCard',
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    finishedAt: {
      type: Date,
    },
    resultList: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        score: Number,
        subject: String,
        passed: {
          type: Number,
          default: 0,
          min: 0,
        },
        failed: {
          type: Number,
          default: 0,
          min: 0,
        },
        skipped: {
          type: Number,
          default: 0,
          min: 0,
        },
        attempted: {
          type: Number,
          default: 0,
          min: 0,
        },
        shared: {
          type: Boolean,
          default: true,
        },
        totalQuestions: {
          type: Number,
          min: 0,
        },
        school: String,
        finished: {
          type: Boolean,
          default: false,
        },
        finishTime: {
          type: Number,
        },
      },
    ],
    status: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('ExamModeResult', examModeResultSchema);
