const User = require('../models/users');
const { badResponse, goodResponseDoc } = require('../utils/response');
const cloudinary = require('../services/cloudinary');
// const CbtUser = require('../models/cbtUser');

exports.getAUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'provide User ID');
    const user = await User.findById(id);
    if (!user) return badResponse(res, 'user does not exist');
    goodResponseDoc(res, 'user Found', 200, user);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(
      'queryId email firstName lastName cbt role createdAt'
    );
    goodResponseDoc(res, 'Users found', 200, users);
  } catch (error) {
    next(error);
  }
};

exports.getUsersByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    const users = await User.find({ organization }).populate([
      { path: 'category' },
      { path: 'subCategory' },
    ]);
    goodResponseDoc(res, 'Users found', 200, users);
  } catch (error) {
    next(error);
  }
};

exports.getUsersName = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return badResponse(res, 'Provide friend email');
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      'queryId email firstName lastName cbt role createdAt'
    );

    if (!user) return badResponse(res, 'User does not exist');

    goodResponseDoc(res, 'user found', 200, user);
  } catch (error) {
    next(error);
  }
};

exports.blockAUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { runValidators: false }
    );

    if (!user) return badResponse(res, 'User does not exist');

    goodResponseDoc(res, 'User blocked', 200, user);
  } catch (error) {
    next(error);
  }
};

exports.unBlockAUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { runValidators: false }
    );

    if (!user) return badResponse(res, 'User does not exist');

    goodResponseDoc(res, 'User unblocked', 200, user);
  } catch (error) {
    next(error);
  }
};

exports.updateMe = (Model) => async (req, res, next) => {
  try {
    // req.body
    if (Object.keys(req.body).length === 0) {
      return badResponse(res, 'Nothing to update');
    }
    const user = req.user;
    if (!user) {
      return badResponse(res, 'User does exist');
    }

    let image = req.user.photo;
    if (req.body.image) {
      if (req.body.image) {
        await cloudinary.uploader
          .upload(req.file.path, { folder: 'uploads' })
          .then((result) => {
            image = result.secure_url;
            // console.log(result.secure_url)
          })
          .catch((err) => console.log(err));
      }
    }

    const updateUser = await Model.findOneAndUpdate(
      { queryId: user.queryId },
      { ...req.body, photo: image },
      {
        runValidators: false,
        validateBeforeSave: false,
      }
    );
    const updatedUser = await Model.findById(updateUser.id);

    goodResponseDoc(res, 'Profile updated Successfully', 200, updatedUser);
  } catch (error) {
    badResponse(res, 'Could not update user');
    next(error);
  }
};

exports.updateEmail = async (req, res, next) => {
  try {
    const user = req.user;
    const { newEmail, password } = req.body;
    if (!newEmail) return badResponse(res, 'Enter New Email');
    if (!(await user.correctPassword(password, user.password))) {
      return badResponse(res, 'Incorrect password');
    }

    const updateuser = await User.findByIdAndUpdate(
      user._id,
      {
        email: newEmail,
      },
      {
        validateBeforeSave: false,
        runValidators: false,
      }
    );
    const updatedUser = await User.findById(updateuser.id);
    goodResponseDoc(res, 'Email updated successfully', 200, updatedUser);
  } catch (error) {
    badResponse(res, 'Could not update Email');
    next(error);
  }
};
