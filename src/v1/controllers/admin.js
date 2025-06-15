const Admin = require('../models/admins');
const { badResponse, goodResponseDoc } = require('../utils/response');

exports.getAllAdminsByOrganization = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const admins = await Admin.find({ organization: organizationId });
    if (!admins || admins.length === 0) {
      return badResponse(res, 'No admins found for this organization');
    }
    return goodResponseDoc(res, 'Admins retrieved successfully', 200, admins);
  } catch (error) {
    next(error);
    badResponse(res, error.message);
  }
};

exports.getAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return badResponse(res, 'Admin not found');
    }
    return goodResponseDoc(res, 'Admin retrieved successfully', 200, admin);
  } catch (error) {
    next(error);
    badResponse(res, error.message);
  }
};
