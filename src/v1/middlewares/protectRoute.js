const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { badResponse, badResponseCustom } = require('../utils/response');

exports.protect = (Model) => async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else {
      return badResponseCustom(
        res,
        401,
        'You are not logged in, Please login to get Access',
        'invalid token'
      );
    }
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser)
      return badResponse(
        res,
        'The user belonging to this token does not exist'
      );
    req.user = currentUser;
    next();
  } catch (error) {
    badResponse(res, error.message);
  }
};
