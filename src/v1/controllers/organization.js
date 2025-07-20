const Organization = require('../models/organization');
const { uploadImage } = require('../utils/image');
const Email = require('../services/email/email');

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
      email,
    });
    if (!organization) {
      return badResponse(res, 400, 'Failed to create organization');
    }

    // const url = `${req.protocol}://${organization.name}.${process.env.HOST}/onboarding/personnel`
    const url = `${req.protocol}://localhost:3000/onboarding/personnel`;

    organization.domain =
      process.env.NODE_ENV === 'production'
        ? `${organization.name.toLocaleLowerCase}.${process.env.HOST}`
        : 'localhost:3000';
    await organization.save({ validateBeforeSave: false });

    await new Email(res, organization, url).welcomeOrganization();

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
  try {
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
  } catch (error) {}
};

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
    const organization = await Organization.findByIdAndUpdate(
      id,
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

exports.updateOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Organization ID');

    const organizationCheck = Organization.findById(id);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    let image = organizationCheck.logo;
    if (req.file && req.file.path) {
      image = await uploadImage(req, res);
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      {
        ...req.body,
        logo: image,
      },
      { runValidators: false, new: false }
    );

    const data = await Organization.findById(organization.id);

    goodResponseDoc(res, 'Organization Updated successfully', 200, data);
  } catch (error) {
    next(error);
  }
};
