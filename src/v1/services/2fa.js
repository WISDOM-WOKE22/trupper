const { badResponse, goodResponseDoc } = require('../utils/response');

exports.Enable2Fa = (Model) => async (req, res) => {
  try {
    if (!req.user) return badResponse(res, 'Please Login');
    const user = await Model.findOneAndUpdate(
      req.user._id,
      {
        twoFactor: true,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!user) return badResponse(res, 'You are not logged in');
    goodResponseDoc(
      res,
      'Two factor authentication enable successfully',
      200,
      user
    );
  } catch (error) {
    badResponse(
      res,
      'Something when wrong could not enable Two factor authentication'
    );
  }
};

exports.disable2Fa = (Model) => async (req, res) => {
  try {
    if (!req.user) return badResponse(res, 'Please Login');
    const user = await Model.findOneAndUpdate(
      req.user._id,
      {
        twoFactor: false,
      },
      {
        new: true,
        runValidators: false,
      }
    );
    if (!user) return badResponse(res, 'You are not logged in');
    goodResponseDoc(
      res,
      'Two factor authentication enable successfully',
      200,
      user
    );
  } catch (error) {
    badResponse(
      res,
      'Something when wrong could not enable Two factor authentication'
    );
  }
};
