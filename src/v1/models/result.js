const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    subject: {
      type: String,
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
    },
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
    totalQuestions: {
      type: Number,
      required: true,
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
    duration: {
      type: String,
    },
    general: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        mainId: {
          type: Schema.Types.ObjectId,
          ref: 'Result',
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
        organization: {
          type: Schema.Types.ObjectId,
          ref: "Organization"
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
