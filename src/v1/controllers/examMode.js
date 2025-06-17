const Exam = require('../models/exam');
const Organization = require('../models/organization');
const SubCategory = require('../models/userCategoryTwo');
const ExamMode = require('../models/examMode');
const {
  badResponse,
  goodResponseDoc,
  goodResponse,
} = require('../utils/response');

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
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide exam mode id');
    const examMode = await ExamMode.findByIdAndUpdate(id, req.body, {
      runValidators: false,
    });

    console.log({ examMode });

    await ExamMode.updateMany(
      { subCategory: examMode.subCategory },
      {
        status: false,
      }
    );

    examMode.status = req.body.status;
    await examMode.save({ validateBeforeSave: false });

    if (!examMode) return badResponse(res, 'Exam Modes does not exist');

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
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide subcategory');

    const examModes = await ExamMode({
      subCategory: id,
      status: true,
    });

    goodResponseDoc(res, 'Exam modes retrieved successfully', 200, examModes);
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
