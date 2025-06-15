const {
  badResponse,
  goodResponse,
  goodResponseDoc,
} = require('../utils/response');
const Organization = require('../models/organization');
const Category = require('../models/userCategory');
const SubCategory = require('../models/userCategoryTwo');
const ExamType = require('../models/examType');
const { updateOne } = require('../utils/factoryFunction');

exports.createExamType = async (req, res, next) => {
  try {
    const { name, status, pastQuestion, organization, category } = req.body;
    if (!name) return badResponse(res, 'Enter a name for exam');

    if (!organization) return badResponse(res, 'Provide Organization ID');

    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const examType = await ExamType.create({
      name,
      status,
      pastQuestion,
      organization,
    });

    goodResponseDoc(res, 'Exam Type created successfully', 201, examType);
  } catch (error) {
    next(error);
  }
};

exports.getExamTypeByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const examTypes = await ExamType.find({
      organization,
    });

    if (!examTypes) return badResponse(res, 'Exam type not found');

    goodResponseDoc(res, 'Data retrieved', 200, examTypes);
  } catch (error) {
    next(error);
  }
};

exports.getExamTypeByOrganizationUser = async (req, res, next) => {
  try {
    const { organization } = req.params;
    const checkOrganization = await Organization.findById(organization);

    if (!checkOrganization) {
      return badResponse(res, 'Organization not found');
    }

    const examTypes = await ExamType.find({
      organization,
      status: true,
    });

    if (!examTypes) return badResponse(res, 'Exam type not found');

    goodResponseDoc(res, 'Data retrieved', 200, examTypes);
  } catch (error) {
    next(error);
  }
};

exports.getAnExamType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam Id');

    const examType = await ExamType.findById(id);
    if (!examType) return badResponse(res, 'Exam Type not found');

    goodResponseDoc(res, 'Exam type retrieved', 200, examType);
  } catch (error) {
    next(error);
  }
};

exports.getExamTypeByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    if (!category) return badResponse(res, 'Provide Category');
    const categoryCheck = await Category.findById(category);
    if (!categoryCheck)
      return badResponse(res, 'This user Category does not exit');

    const examType = await ExamType.find({
      category: categoryCheck.id,
    });

    goodResponseDoc(res, 'Retrieved exam types by category ', 200, examType);
  } catch (error) {
    next(error);
  }
};

exports.getExamTypeBySubCategory = async (req, res, next) => {
  try {
    const { subCategory } = req.body;
    if (!subCategory) return badResponse(res, 'Provide Sub Category ID');
    const subCategoryCheck = await SubCategory.findById(subCategory);
    if (!subCategoryCheck)
      return badResponse(res, 'This  Sub Category does not exit');

    const examType = await ExamType.find({
      subCategory: subCategoryCheck.id,
    });

    goodResponseDoc(res, 'Retrieved exam types by category ', 200, examType);
  } catch (error) {
    next(error);
  }
};

exports.deleteExamType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam ID');

    const deleteExamType = await ExamType.findByIdAndDelete(id);
    if (!deleteExamType) return badResponse(res, 'Failed to delete Exam type');

    goodResponse(res, 'Deleted Exam Type Successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateExamType = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam Type ID');
    const examType = await ExamType.findByIdAndUpdate(id, req.body, {
      runValidators: false,
    });

    if (!examType) return badResponse(res, 'Exam Type does not exist');
    goodResponseDoc(res, 'Exam updated Successfully', 200, examType);
  } catch (error) {
    next(error);
  }
};
