const Organization = require('../models/organization');
const { badResponse } = require('./response');

exports.organizationCheck = async (res, organizationId) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) return badResponse(res, 'Organization does not exit');
};
