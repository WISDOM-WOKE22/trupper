const Organization = require('../models/organization');

const {
  badResponse,
  goodResponseDoc,
  badResponseCustom,
} = require('../utils/response');

exports.createOrganization = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name) {
      return badResponse(res, 'Provide Organization name');
    }
    if (!email) {
      return badResponse(res, 'Provide Organization email');
    }
    if (!name || !email) {
      return badResponse(res, 'Please provide all required fields');
    }

    const organization = await Organization.create({
      name,
      email
    });
    if (!organization) {
      return badResponse(res, 400, 'Failed to create organization');
    }
    return goodResponseDoc(
      res,
      'Organization created successfully',
      201,
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
      // return badResponse(res, 'Organization not found');
      return badResponseCustom(
        res,
        404,
        'Organization not found',
        'Organization not found'
      );
    }
    return goodResponseDoc(
      res,
      'Organization retrieved successfully',
      200,
      organization
    );
  } catch (error) {
    next(error);
  }
};

exports.getAnOrganizationByDomain = async (req, res, next) => {
  try{
    const { domain } = req.params;
    const organization = await Organization.findOne({ domain });
    if (!organization) {
      // return badResponse(res, 'Organization not found');
      return badResponseCustom(
        res,
        404,
        'Organization not found',
        'Organization not found'
      );
    }
    return goodResponseDoc(
      res,
      'Organization retrieved successfully',
      200,
      organization
    );
  } catch(error){

  }
}

exports.getAllOrganizations = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizations = await Organization.find(id);
    return goodResponseDoc(
      res,
      'Organization retrieved successfully',
      200,
      organizations
    );
  } catch (error) {
    next(error);
  }
};

exports.suspendOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id)
    const organization = await Organization.findByIdAndUpdate(
      id ,
      { status: 'suspended' },
      { runValidators: false }
    );
    if (!organization) {
      return badResponse(res, 'Organization not found');
    }
    return goodResponseDoc(
      res,
      'Organization suspended successfully',
      200,
      organization
    );
  } catch (error) {
    next(error);
  }
};

exports.unsuspendOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByIdAndUpdate(
      id,
      { status: 'active' },
      { new: true }
    );
    if (!organization) {
      return badResponse(res, 'Organization not found');
    }
    return goodResponseDoc(
      res,
      'Organization Activated successfully',
      200,
      organization
    );
  } catch (error) {
    next(error);
  }
};
