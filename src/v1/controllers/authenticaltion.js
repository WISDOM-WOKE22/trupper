const User = require('../../models/users');
const Organization = require('../../models/organization');
const Email = require('../../utils/email');
const jwt = require('jsonwebtoken');
const {
  badResponse,
  goodResponseDoc,
  goodResponse,
  goodResponseCustom,
} = require('../utils/response');
const { consoleError, consoleMessage } = require('../utils/console');
const {
  jwtToken,
  randomToken,
  generateCode,
  verifyJwt,
} = require('../utils/Token');

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, organization } = req.body;

    if (!firstName) return badResponse(res, 'First Name is missing');
    if (!lastName) return badResponse(res, 'Last Name is Required');
    if (!email || !phone) return badResponse(res, 'Enter contact information');
    if (!organization)
      return badResponse(res, 'Please provide an organization Id');

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      organization,
    });

    if (!user) return badResponse(res, 'Failed to create user');
    const token = jwtToken(user._id, user.email);
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/verify/${token}`;
    const message = `Welcome to our platform, ${user.firstName} ${user.lastName}. Please verify your email by clicking on the link: ${url}`;
    await new Email(user, url).sendWelcome(message);
    return goodResponseDoc(res, 'User created successfully', 201, user);
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
    try{
        
    } catch(error){
        next(error)
    }
};