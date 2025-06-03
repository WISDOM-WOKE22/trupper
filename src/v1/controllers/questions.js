const Question = require('../models/questions');
const Subject = require('../models/subject');
const { goodResponseDoc, badResponse } = require('../utils/response');
const { consoleError } = require('../utils/console');
const { deleteOne, updateOne, createOne } = require('../utils/factoryFunction');
const cloudinary = require('../services/cloudinary');
// const { organizationCheck } = require('../utils/checks');

exports.createQuestion = async (req, res, next) => {
  console.log(req.body)
  try {
    const {
      question,
      options,
      subject,
      examyear,
      section,
      questionType,
      answer,
      questionCategory,
      reason,
      organization,
    } = req.body;

    if (!question) return badResponse(res, 'Please provide a question');
    if (!options) return badResponse(res, 'Please create options for this question');

    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
      if (!Array.isArray(parsedOptions) || parsedOptions.length < 3) {
        return badResponse(res, 'A question must have at least 3 options');
      }
    } catch (err) {
      return badResponse(res, 'Invalid options format. Must be a JSON array');
    }

    if (!subject) return badResponse(res, 'Select the subject it belongs to');
    if (!answer) return badResponse(res, 'Select an answer');

    // Optionally enable:
    // if (!organizationCheck(res, organization)) return;

    const sub = await Subject.findById(subject);
    if (!sub) return badResponse(res, 'This subject does not exist');

    let image = '';
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'uploads' });
        image = result.secure_url;
      } catch (err) {
        consoleError(err);
        return badResponse(res, 'Failed to upload image');
      }
    }

    const questionDoc = await Question.create({
      question,
      subject: sub._id,
      options: parsedOptions,
      questionType,
      examyear,
      section,
      answer,
      image,
      questionCategory: questionCategory || 'paid',
      reason,
      organization,
    });

    return goodResponseDoc(res, 'Question created successfully', 201, questionDoc);
  } catch (error) {
    consoleError(error);
    return next(error);
  }
};

exports.AddQuestion = createOne(Question)

exports.getAQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Question QueryId');

    const question = await Question.findOne({ queryId: id }).populate('subject');
    if (!question) return badResponse(res, 'Question not found');

    return goodResponseDoc(res, 'Question found', 200, question);
  } catch (error) {
    return next(error);
  }
};

exports.getAllQuestions = async (req, res, next) => {
  try {
    const { subject, year } = req.query;
    const filter = {};

    if (subject) filter.subject = subject;
    if (year) filter.examyear = year;

    const questions = await Question.find(filter).populate('subject');
    return goodResponseDoc(res, 'Questions fetched', 200, questions);
  } catch (error) {
    return next(error);
  }
};

exports.getQuestionsByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) return badResponse(res, 'Provide organization data');

    // Optionally enable:
    // if (!organizationCheck(res, organization)) return;

    const questions = await Question.find({ organization });
    return goodResponseDoc(res, 'Questions retrieved successfully', 200, questions);
  } catch (error) {
    return next(error);
  }
};

exports.getQuestionsBySubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide subject ID');

    const questions = await Question.find({ subject: id });
    return goodResponseDoc(res, 'Subject questions fetched', 200, questions);
  } catch (error) {
    return next(error);
  }
};

exports.deleteAQuestion = deleteOne(Question);
exports.updateQuestion = updateOne(Question);
