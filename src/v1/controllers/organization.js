const Organization = require('../../models/organization');

const { badResponse, goodResponseDoc } = require('../utils/response');

exports.createOrganization = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return badResponse(res, 400, 'Please provide all required fields');
    }

    const organization = await Organization.create({
      name,
      email,
      logo: req.file ? req.file.path : null,
    });
    if (!organization) {
      return badResponse(res, 400, 'Failed to create organization');
    }
    return goodResponseDoc(
      res,
      201,
      'Organization created successfully',
      organization
    );
  } catch (error) {
    if (error.code === 11000) {
      return badResponse(res, 'These Organization name is already used');
    }
    next(error);
  }
};

exports.getAnOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id);
    if (!organization) {
      return badResponse(res, 404, 'Organization not found');
    }
    return goodResponseDoc(
      res,
      200,
      'Organization retrieved successfully',
      organization
    );
  } catch (error) {
    next(error);
  }
};

exports.suspendOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByIdAndUpdate(
      { id },
      { status: 'suspended' },
      { new: true }
    );
    if (!organization) {
      return badResponse(res, 404, 'Organization not found');
    }
    return goodResponseDoc(
      res,
      200,
      'Organization suspended successfully',
      organization
    );
  } catch (error) {
    next(error);
  }
};

exports.suspendOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByIdAndUpdate(
      { id },
      { status: 'active' },
      { new: true }
    );
    if (!organization) {
      return badResponse(res, 404, 'Organization not found');
    }
    return goodResponseDoc(
      res,
      200,
      'Organization Activated successfully',
      organization
    );
  } catch (error) {
    next(error);
  }
};
