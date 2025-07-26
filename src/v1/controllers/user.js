const mongoose = require('mongoose');
const User = require('../models/users');
const { badResponse, goodResponseDoc } = require('../utils/response');
const { uploadImage } = require('../utils/image');
const Result = require('../models/result');

exports.getAUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate user ID
    if (!id) return badResponse(res, 'User ID is required');
    if (!mongoose.Types.ObjectId.isValid(id))
      return badResponse(res, 'Invalid User ID');

    // Fetch user
    const user = await User.findById(id)
      .populate({ path: 'category', select: 'name' })
      .populate({ path: 'subCategory', select: 'name' });
    if (!user) return badResponse(res, 'User does not exist');

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(id);

    // Aggregation pipeline to properly calculate stats
    const analysis = await Result.aggregate([
      // Only results for this user (either direct or in general array)
      {
        $match: {
          $or: [{ user: userObjectId }, { 'general.user': userObjectId }],
        },
      },
      // Unwind general so we can get all attempts for this user
      {
        $unwind: {
          path: '$general',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Only keep general rows for this user, or the root doc if user matches
      {
        $match: {
          $or: [{ user: userObjectId }, { 'general.user': userObjectId }],
        },
      },
      // Overlay general fields if present, otherwise use root
      {
        $addFields: {
          _merged: {
            $cond: [
              { $eq: ['$general.user', userObjectId] },
              {
                $mergeObjects: [
                  '$$ROOT',
                  '$general',
                  { isGeneralResult: true },
                ],
              },
              {
                $mergeObjects: ['$$ROOT', { isGeneralResult: false }],
              },
            ],
          },
        },
      },
      { $replaceWith: '$_merged' },
      { $project: { general: 0, _merged: 0 } },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          results: [{ $limit: 15 }],
          stats: [
            {
              $group: {
                _id: null,
                totalExams: { $sum: 1 },
                totalQuestions: { $sum: { $ifNull: ['$totalQuestions', 0] } },
                totalPassedQuestions: { $sum: { $ifNull: ['$passed', 0] } },
                totalAttemptedQuestions: {
                  $sum: { $ifNull: ['$attempted', 0] },
                },
                totalSkippedQuestions: { $sum: { $ifNull: ['$skipped', 0] } },
                totalFailedQuestions: { $sum: { $ifNull: ['$failed', 0] } },
                totalScore: { $sum: { $ifNull: ['$score', 0] } },
              },
            },
            {
              $addFields: {
                averageScore: {
                  $cond: [
                    { $eq: ['$totalExams', 0] },
                    0,
                    { $divide: ['$totalScore', '$totalExams'] },
                  ],
                },
              },
            },
            { $project: { _id: 0, totalScore: 0 } },
          ],
        },
      },
    ]);

    // Safely handle aggregation output
    const { results = [], stats = [] } = analysis[0] || {};
    const statsObj =
      stats.length > 0
        ? stats[0]
        : {
            totalExams: 0,
            totalQuestions: 0,
            totalPassedQuestions: 0,
            totalAttemptedQuestions: 0,
            totalSkippedQuestions: 0,
            totalFailedQuestions: 0,
            averageScore: 0,
          };

    goodResponseDoc(res, 'User found', 200, { user, results, stats: statsObj });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    let {
      page = 1,
      limit = 10,
      email,
      name,
      dateFrom,
      dateTo,
      blocked,
      active,
      userCategory,
      userCategoryTwo,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    if (blocked !== undefined) {
      if (blocked === 'true' || blocked === true) filter.isBlocked = true;
      if (blocked === 'false' || blocked === false) filter.isBlocked = false;
    }
    if (active !== undefined) {
      if (active === 'true' || active === true) filter.status = 'active';
      if (active === 'false' || active === false) filter.status = 'inactive';
    }
    if (userCategory) {
      filter.category = userCategory;
    }
    if (userCategoryTwo) {
      filter.subCategory = userCategoryTwo;
    }

    const users = await User.find(filter)
      .select('queryId email firstName lastName cbt role createdAt')
      .skip(skip)
      .limit(limit);
    const total = await User.countDocuments(filter);

    goodResponseDoc(res, 'Users found', 200, {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsersByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    const {
      email,
      name,
      dateFrom,
      dateTo,
      blocked,
      active,
      userCategory,
      userCategoryTwo,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = { organization };
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    if (blocked !== undefined) {
      if (blocked === 'true' || blocked === true) filter.isBlocked = true;
      if (blocked === 'false' || blocked === false) filter.isBlocked = false;
    }
    if (active !== undefined) {
      if (active === 'true' || active === true) filter.status = 'active';
      if (active === 'false' || active === false) filter.status = 'inactive';
    }
    if (userCategory) {
      filter.category = userCategory;
    }
    if (userCategoryTwo) {
      filter.subCategory = userCategoryTwo;
    }

    const users = await User.find(filter)
      .populate([{ path: 'category' }, { path: 'subCategory' }])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await User.countDocuments(filter);

    goodResponseDoc(res, 'Users found', 200, {
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
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

    // Handle image upload
    let image = '';
    if (req.file) {
      image = await uploadImage(req, res);
    }

    const updateUser = await Model.findOneAndUpdate(
      { queryId: user.queryId },
      { ...req.body, photo: image ?? user.photo },
      {
        runValidators: false,
        validateBeforeSave: false,
      }
    );
    const updatedUser = await Model.findById(updateUser.id);

    goodResponseDoc(res, 'Profile updated Successfully', 200, updatedUser);
  } catch (error) {
    // badResponse(res, 'Could not update user');
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
