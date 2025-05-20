const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new mongoose.Schema(
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
      status: {
        type: Boolean,
        default: true,
      },
      organization: {
        type: Schema.Types.ObjectId,
        ref: "Organization"
      },
      pastQuestion: {
        type: Boolean,
        default: true,
      },
      queryId: String,
      category: String,
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  )

const Subjects = mongoose.model("Subject", subjectSchema)

module.exports = Subjects;
