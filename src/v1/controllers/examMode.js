const Exam = require('../models/exam');
const Organization = require('../models/organization');
const SubCategory = require('../models/userCategoryTwo');
const ExamMode = require('../models/examMode');
const ExamModeCard = require('../models/examModeCard');
const ExamModeResult = require('../models/examModeResult');
const User = require('../models/users');
const {
  badResponse,
  goodResponseDoc,
  goodResponse,
} = require('../utils/response');
const { getIO } = require('../services/socket/io');

exports.createExamMode = async (req, res, next) => {
  try {
    const { name, exam, organization, category, subCategory, status } =
      req.body;
    if (!name) return badResponse(res, 'Provide Exam mode name');
    if (!exam) return badResponse(res, 'Provide exam id');
    if (!organization) return badResponse(res, 'Provide organization ID');
    if (!subCategory) return badResponse(res, 'Provide user sub category');
    const user = req.user;

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const subCategoryCheck = await SubCategory.findById(subCategory);
    if (!subCategoryCheck)
      return badResponse(res, 'This sub category does not exist');

    const examMode = await ExamMode.create({
      name: name,
      exam,
      subCategory,
      category: subCategoryCheck.userCategory,
      status,
      organization,
      createdBy: user._id,
    });

    if (!examMode) return badResponse(res, 'Could not create Exam mode');

    goodResponseDoc(res, 'Exam Mode created successfully', 201, examMode);
  } catch (error) {
    next(error);
  }
};

exports.updateExamMode = async (req, res, next) => {
  try {
    const io = getIO();
    const user = req.user;
    const { id } = req.params;
    const { subjects, organization } = req.body;
    let subjectArray = [];
    if (!id) return badResponse(res, 'Provide exam mode id');
    const examMode = await ExamMode.findByIdAndUpdate(id, req.body, {
      runValidators: false,
    });

    await ExamMode.updateMany(
      { subCategory: examMode.subCategory },
      {
        status: false,
      }
    );

    examMode.status = req.body.status;
    await examMode.save({ validateBeforeSave: false });

    if (!examMode) return badResponse(res, 'Exam Modes does not exist');

    if (req.body.status === true) {
      if (subjects.length > 0) {
        subjects.map((el) => {
          subjectArray.push(el.id);
        });
      }
      const examModeCard = await ExamModeCard.create({
        examMode: examMode._id,
        status: true,
        subjects: subjectArray,
        createdBy: user._id,
        exam: examMode.exam,
      });

      // Add all users from the same user category (subCategory) to resultList
      const usersInCategory = await User.find(
        {
          subCategory: examMode.subCategory,
          status: true,
          organization: organization,
          role: 'User',
        },
        '_id'
      );
      const resultList = usersInCategory.map((u) => ({
        user: u._id,
        score: 0,
        subject: null,
        passed: 0,
        failed: 0,
        skipped: 0,
        attempted: 0,
      }));

      const examModeResult = await ExamModeResult.create({
        examMode: examMode._id,
        examModeCard: examModeCard._id,
        exam: examMode.exam,
        createdBy: user._id,
        resultList: resultList,
        finishedAt: examMode.validTill,
        organization: organization,
      });

      examModeCard.result = examModeResult._id;
      await examModeCard.save({ validateBeforeSave: false });

      io.emit('examModeActivated', examMode);
    } else if (req.body.status === false) {
      io.emit('examModeDeactivated', examMode);
    }

    goodResponseDoc(res, 'Exam mode updated successfully', 200, examMode);
  } catch (error) {
    next(error);
  }
};

exports.getExamModesBySubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide subcategory is');

    const examModes = await ExamMode.find({
      subCategory: id,
    }).populate([{ path: 'createdBy' }, { path: 'exam' }]);

    goodResponseDoc(res, 'Exam modes retrieved successfully', 200, examModes);
  } catch (error) {
    next(error);
  }
};

exports.getExamModesBySubCategoryUser = async (req, res, next) => {
  try {
    const user = req.user;

    // Find all active exam modes for the user's subcategory
    const examModes = await ExamMode.find({
      subCategory: user.subCategory,
      status: true,
    }).populate([{ path: 'createdBy' }, { path: 'exam' }]);

    if (examModes.length === 0) {
      return goodResponseDoc(res, 'No exam modes found', 200, null);
    } else {
      const examResult = await ExamModeResult.findOne({
        examMode: examModes[0]._id,
      }).populate('resultList.user');

      if (examResult) {
        const userResult = examResult.resultList.find(
          (result) =>
            result.user._id.toString() === user._id.toString() &&
            result.score > 0
        );
        if (userResult) {
          return goodResponseDoc(
            res,
            'You have already written this exam mode. You cannot write it again.',
            200,
            null
          );
        } else {
          return goodResponseDoc(
            res,
            'You have not written this exam mode. You can write it now.',
            200,
            examModes[0]
          );
        }
      } else {
        return goodResponseDoc(
          res,
          'You have not written this exam mode. You can write it now.',
          200,
          examModes[0]
        );
      }
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteAnExamMode = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide exam mode id');
    const examMode = await ExamMode.findByIdAndDelete(id);

    if (!examMode) return badResponse(res, 'Exam Modes does not exist');

    goodResponse(res, 'Exam mode deleted successfully');
  } catch (error) {
    next(error);
  }
};
