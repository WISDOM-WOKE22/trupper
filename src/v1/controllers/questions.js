const Question = require('../models/questions');
const Subject = require('../models/subject');
const { goodResponseDoc, badResponse } = require('../utils/response');
const { consoleError } = require('../utils/console');
const { deleteOne, updateOne, createOne } = require('../utils/factoryFunction');
const cloudinary = require('../services/cloudinary');
const { uploadImage } = require('../utils/image');
// const { organizationCheck } = require('../utils/checks');

exports.createQuestion = async (req, res, next) => {
  try {
    const {
      question,
      a,
      b,
      c,
      d,
      subject,
      examyear,
      section,
      questionType,
      answer,
      questionCategory,
      reason,
      organization,
      exam,
    } = req.body;

    if (!question) return badResponse(res, 'Please provide a question');

    if (!subject) return badResponse(res, 'Select the subject it belongs to');
    if (!answer) return badResponse(res, 'Select an answer');

    const sub = await Subject.findById(subject);
    if (!sub) return badResponse(res, 'This subject does not exist');

    let image = '';
    if (req.file && req.file.path) {
      image = await uploadImage(req, res);
    }

    const questionDoc = await Question.create({
      question,
      subject: sub._id,
      options: { a, b, c, d },
      questionType,
      examyear,
      section,
      answer,
      image,
      questionCategory: questionCategory || 'test',
      reason,
      organization,
      exam,
    });

    return goodResponseDoc(
      res,
      'Question created successfully',
      201,
      questionDoc
    );
  } catch (error) {
    consoleError(error);
    return next(error);
  }
};

exports.AddQuestion = createOne(Question);

exports.getAQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Question QueryId');

    const question = await Question.findById(id)
      .populate({
        path: 'subject',
      })
      .populate({ path: 'exam' });
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

    // Destructure and parse query params with defaults
    const { subject, exam, examyear, page = 1, limit = 10 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build filter object efficiently
    const filter = { organization };
    if (subject) filter.subject = subject;
    if (exam) filter.exam = exam;
    if (examyear) filter.examyear = examyear;

    // Use Promise.all to parallelize DB calls for efficiency
    const [questions, total, totalOfOrganization, totalAIOrganization] =
      await Promise.all([
        Question.find(filter)
          .populate('subject')
          .skip(skip)
          .limit(parsedLimit)
          .lean()
          .sort({ createdAt: -1 }),
        Question.countDocuments(filter),
        Question.countDocuments({ organization }),
        Question.countDocuments({ organization, method: 'ai' }),
      ]);

    return goodResponseDoc(res, 'Questions retrieved successfully', 200, {
      questions,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalOfOrganization,
      totalAIOrganization,
      totalPages: Math.ceil(total / parsedLimit),
    });
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

exports.deleteAQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide subject ID');

    const questions = await Question.findByIdAndDelete(id);
    return goodResponseDoc(
      res,
      'Question Deleted Successfully',
      200,
      questions
    );
  } catch (error) {
    return next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      question,
      a,
      b,
      c,
      d,
      subject,
      examyear,
      section,
      questionType,
      answer,
      questionCategory,
      reason,
      organization,
      exam,
    } = req.body;

    if (!id) return badResponse(res, 'Provide Question ID');
    if (!question) return badResponse(res, 'Please provide a question');
    if (!subject) return badResponse(res, 'Select the subject it belongs to');
    if (!answer) return badResponse(res, 'Select an answer');

    const sub = await Subject.findById(subject);
    if (!sub) return badResponse(res, 'This subject does not exist');

    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) return badResponse(res, 'Question not found');

    let image = existingQuestion.image;
    if (req.file && req.file.path) {
      image = await uploadImage(req, res);
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        question,
        subject: sub._id,
        options: { a, b, c, d },
        questionType,
        examyear,
        section,
        answer,
        image,
        questionCategory: questionCategory || 'paid',
        reason,
        organization,
        exam,
      },
      { new: true, runValidators: true }
    )
      .populate('subject')
      .populate('exam');

    return goodResponseDoc(
      res,
      'Question updated successfully',
      200,
      updatedQuestion
    );
  } catch (error) {
    consoleError(error);
    return next(error);
  }
};
