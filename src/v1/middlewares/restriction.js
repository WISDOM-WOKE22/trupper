const { badResponse } = require('../utils/response');

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return badResponse(
        res,
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};
// one of my guy for hng cash ou 60k for web 3