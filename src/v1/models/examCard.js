const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

const examCardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ExamCategory',
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'SchoolList',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CategorySubject',
      },
    ],
    sharedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'expired'],
      default: 'active',
    },
    searchCode: String,
    queryId: String,
    expires: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

examCardSchema.pre('save', async function (next) {
  this.queryId = crypto.randomBytes(20).toString('hex');
  next();
});

const ExamCard = mongoose.model('ExamCard', examCardSchema);

module.exports = ExamCard;
