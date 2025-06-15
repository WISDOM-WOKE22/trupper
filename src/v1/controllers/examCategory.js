const Exam = require('../models/exam');
const CategorySubject = require('../models/categorySubject');
const { consoleError } = require('../utils/console');
const ExamCategory = require('../models/examCategory');
const Organization = require('../models/organization');
const {
  badResponse,
  goodResponseDoc,
  goodResponse,
} = require('../utils/response');

exports.createExamCategory = async (req, res, next) => {
  try {
    const { name, exam, status, subjects, organization } = req.body;
    let subjectArray = [];
    let createdSubjectsIdArray = [];

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    if (!name) return badResponse(res, 'Provide exam category Name');
    if (!exam) return badResponse(res, 'Please select an exam');
    if (!subjects.length === 0)
      return badResponse(res, 'Please select an subjects');

    const examCheck = await Exam.findById(exam);

    if (!examCheck) return badResponse(res, 'Exam does not exist');

    if (subjects.length > 0) {
      subjects.map((el) => {
        console.log(el);
        subjectArray.push({
          name: el.value,
          subject: el.id,
          exam: examCheck._id,
          organization,
        });
      });
    }

    const createdSubjects = await CategorySubject.insertMany(subjectArray);

    createdSubjects.map((el) => {
      createdSubjectsIdArray.push(el.id);
    });

    await ExamCategory.create({
      name,
      exam: examCheck._id,
      examType: examCheck.examType,
      subjects: createdSubjectsIdArray,
      status,
      organization,
    });

    const examCategories = await ExamCategory.find({ exam: examCheck._id });

    goodResponseDoc(
      res,
      'Exam category created successfully',
      201,
      examCategories
    );
  } catch (error) {
    consoleError(error);
    if (error.code === 11000) {
      return badResponse(res, 'Category already exist');
    }
    next(error);
  }
};

exports.getAnExamCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam category Id');

    const examCategory = await ExamCategory.findById(id).populate([
      // { path: 'subjects' },
      { path: 'examType' },
      { path: 'exam' },
    ]);

    if (!examCategory) return badResponse(res, 'Exam category does not exist');

    goodResponseDoc(res, 'Exam Category', 200, examCategory);
  } catch (error) {
    consoleError(error);
    next(error);
  }
};

exports.getCategoryByExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam Id');

    const examCategory = await ExamCategory.find({ exam: id }).populate(
      'subjects'
    );
    goodResponseDoc(res, 'Exam Category', 200, examCategory);
  } catch (error) {
    consoleError(error);
    next(error);
  }
};

exports.getCategoryByExamUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam Id');

    const examCategory = await ExamCategory.find({
      exam: id,
      status: true,
    }).populate({
      path: 'subjects',
      match: { active: true },
    });
    goodResponseDoc(res, 'Exam Category', 200, examCategory);
  } catch (error) {
    consoleError(error);
    next(error);
  }
};

exports.removeCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await ExamCategory.findById(id);

    if (!category) return badResponse(res, 'Exam category does not exit');
    const categorySubjects = await category.subjects;

    if (categorySubjects.length > 0) {
      await Promise.all(
        categorySubjects.map(async (subject) => {
          await CategorySubject.findByIdAndDelete({ _id: subject });
        })
      );
    }

    await ExamCategory.findByIdAndDelete({ _id: category._id });

    goodResponse(res, 'Exam category removed successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateExamCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, name, subjects } = req.body;

    const examCategory = await ExamCategory.findByIdAndUpdate(
      id,
      {
        status,
        name,
        subjects,
      },
      { new: true }
    );

    if (!examCategory) return badResponse(res, 'Exam category not found');

    goodResponseDoc(
      res,
      'Exam category updated successfully',
      200,
      examCategory
    );
  } catch (error) {
    consoleError(error);
    next(error);
  }
};
