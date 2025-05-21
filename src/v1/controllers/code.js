const Organization = require('../models/organization');
const Code = require('../models/code');
const { badResponse, goodResponseDoc } = require('../utils/response');
const { generateCode, generateUniqueCodes } = require('../utils/generate');

exports.generateSingleCode = async (req, res, next) => {
  try {
    const { expiresIn, category, subCategory, organization } = req.body;
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization) {
      return badResponse(res, 'Organization does not exist');
    }

    const newCode = await Code.create({
      code: generateCode(8),
      expiresIn,

      category,
      subCategory,
      organization: checkOrganization._id,
    });
    if (!newCode) {
      return badResponse(res, 'Failed to create code');
    }
    return goodResponseDoc(res, 'Code created successfully', 201, newCode);
  } catch (error) {
    next(error);
  }
};

exports.generateBulkCodes = async (req, res, next) => {
  try {
    const { expiresIn, category, subCategory, organization, count } = req.body;

    // Validate inputs
    if (!organization) {
      return badResponse(res, 'Provide Organization id');
    }
    if (!count || !Number.isInteger(count) || count < 1 || count > 100000) {
      return badResponse(res, 'Provide valid count (1-100000)');
    }

    const checkOrganization = await Organization.findById(organization);
    if (!checkOrganization) {
      return badResponse(res, 'Organization does not exist');
    }

    // Generate unique codes
    const codes = generateUniqueCodes(count).map((code) => ({
      code,
      expiresIn,
      category,
      subCategory,
      organization: checkOrganization._id,
    }));

    // Bulk insert with lean options
    const newCodes = await Code.insertMany(codes, {
      ordered: false,
      rawResult: true,
    });

    if (!newCodes || newCodes.insertedCount === 0) {
      return badResponse(res, 'Failed to create codes');
    }

    return goodResponseDoc(
      res,
      `Successfully created ${newCodes.insertedCount} codes`,
      201,
      newCodes.insertedIds
    );
  } catch (error) {
    next(error);
  }
};

exports.getAllOrganizationCodes = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const codes = await Code.find({ organization: organizationId })
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subCategory', select: 'name' });
    if (!codes || codes.length === 0) {
      return badResponse(res, 'No codes found for this organization');
    }
    return goodResponseDoc(res, 'Codes retrieved successfully', 200, codes);
  } catch (error) {
    next(error);
  }
};

exports.deleteACode = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide code ID');

    const codeCheck = await Code.findByIdAndDelete(id);
    if (!codeCheck) return badResponse(res, 'Code does not exist');
    return goodResponse(res, 'Code deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getACode = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide code ID');

    const codeCheck = await Code.findById(id);
    if (!codeCheck) return badResponse(res, 'Code does not exist');
    return goodResponseDoc(res, 'Code retrieved successfully', 200, codeCheck);
  } catch (error) {
    next(error);
  }
};
