const WaitList = require('../models/waitList');
const Email = require('../services/email/email');
const Organization = require('../models/organization');
const { badResponse, goodResponse } = require('../utils/response');

const addToWaitList = async (req, res) => {
  try {
    const { email, organization } = req.body;
    if (!email || !organization) {
      return badResponse(res, 'Email and organization are required');
    }
    const emailExists = await WaitList.findOne({ email });
    if (emailExists) {
      return badResponse(res, 'You are already on the waitlist');
    }

    const organizationExists = await Organization.findOne({ email: email });
    if (organizationExists) {
      return badResponse(res, 'An organization already exist with this email');
    }

    const waitList = new WaitList({ email, organization });
    await waitList.save();
    await new Email(res, waitList, '', '', '').waitlist();
    goodResponse(res, 'You are on the waitlist');
  } catch (error) {
    console.log(error);
    return badResponse(res, 'Something went wrong');
  }
};

module.exports = { addToWaitList };
