const ExamCard = require('../models/examCard');
const Exam = require('../models/exam');
const CategorySubject = require('../models/categorySubject');

const {
  badResponse,
  goodResponseDoc,
  badResponseCustom,
} = require('../utils/response');
const { getMany, getOne, deleteOne } = require('../utils/factoryFunction');

// const currentDate = new Date();
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

exports.createExamCard = async (req, res, next) => {
  try {
    const { exam, subjects, category, school } = req.body;
    const user = req.user;

    let subjectArray = [];

    if (!exam) return badResponse(res, 'Provide exam ID');
    if (!subjects.length === 0) return badResponse(res, 'Select subjects');
    if (!category) return badResponse(res, 'Provide Exam category');

    const examCheck = await Exam.findOne({ _id: exam });
    if (!examCheck) return badResponse(res, 'Exam does not exist');

    if (subjects.length > 0) {
      subjects.map((el) => {
        subjectArray.push(el.id);
      });
    }

    let code = '';
    for (let i = 0; i < 10; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const examCard = await ExamCard.create({
      user: user.id,
      exam: examCheck.id,
      category,
      subjects: subjectArray,
      // expires,
      school,
      searchCode: code,
    });

    const doc = {
      examCard,
      exam: examCheck,
    };

    goodResponseDoc(res, 'Exam card created successfully', 201, doc);
  } catch (error) {
    next(error);
  }
};

exports.getExamCardByUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!id) return badResponse(res, 'Provide User id');
    const examCards = await ExamCard.find({ user: user.id })
      .populate('subjects')
      .populate([{ path: 'category' }, { path: 'exam' }, { path: 'school' }])
      .sort({ createdAt: -1 });
    goodResponseDoc(res, 'User Subscriptions', 200, { examCards });
  } catch (error) {
    next(error);
  }
};

exports.deleteExamCard = deleteOne(ExamCard);

exports.getExamCardSubjects = async (req, res, next) => {
  try {
    let subjects = [];
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Subscription query id');
    const subscription = await ExamCard.findOne({ queryId: id });

    if (subscription.subjects.length > 0) {
      await Promise.all(
        subscription.subjects.map(async (subject) => {
          const sub = await CategorySubject.findById({ _id: subject }).populate(
            [
              { path: 'exam' },
              { path: 'examType' },
              {
                path: 'subject',
                populate: {
                  path: 'exam',
                },
              },
            ]
          );
          subjects.push(sub);
        })
      );
    }
    goodResponseDoc(res, 'Exam subjects gotten', 200, subjects);
  } catch (error) {
    next(error);
  }
};
