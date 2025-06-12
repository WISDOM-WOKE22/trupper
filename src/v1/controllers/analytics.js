const mongoose = require('mongoose');
const Users = require('../models/users');
const Admins = require('../models/admins');
const Questions = require('../models/questions');
const Exams = require('../models/exam');
const ExamTypes = require('../models/examType');
const userCategory = require('../models/userCategory');
const userCategoryTwo = require('../models/userCategoryTwo');
const Notifications = require('../models/notification');
const Subjects = require('../models/subject');
const ExamCategories = require('../models/examCategory');
const {
  badResponse,
  goodResponse,
  goodResponseDoc,
} = require('../utils/response');
const Organization = require('../models/organization');

exports.getAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide organization ID');

    const organizationCheck = await Organization.findById(id);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const countDocuments = (model, query = {}) => model.countDocuments(query);

    // Constants
    const MONTHS = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const now = new Date();

    // Build last 12 months (rolling)
    const monthsRolling = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsRolling.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const [
      userCount,
      subjectCount,
      ExamCategoriesCount,
      QuestionsCount,
      ExamCount,
      userCategoryCount,
      userCategoryTwoCount,
      ExamTypeCount,
      AdminCount,
      rawUserCounts,
    ] = await Promise.all([
      countDocuments(Users, { organization: id }),
      countDocuments(Subjects, { organization: id }),
      countDocuments(ExamCategories, { organization: id }),
      countDocuments(Questions, { organization: id }),
      countDocuments(Exams, { organization: id }),
      countDocuments(userCategory, { organization: id }),
      countDocuments(userCategoryTwo, { organization: id }),
      countDocuments(ExamTypes, { organization: id }),
      countDocuments(Admins, { organization: id, role: 'SUB_ADMIN' }),

      // Monthly user signups aggregation
      Users.aggregate([
        {
          $match: {
            organization: new mongoose.Types.ObjectId(id),
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            signups: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Convert raw aggregation result to a map for easy lookup
    const signupMap = new Map();
    rawUserCounts.forEach((entry) => {
      const key = `${entry._id.year}-${entry._id.month}`;
      signupMap.set(key, entry.signups);
    });

    // Final formatted chart data
    const chartData = monthsRolling.map(({ year, month }) => {
      const key = `${year}-${month}`;
      return {
        month: MONTHS[month - 1],
        signups: signupMap.get(key) || 0,
      };
    });

    const analyticsData = {
      userCount,
      subjectCount,
      ExamCategoriesCount,
      QuestionsCount,
      ExamCount,
      userCategoryCount,
      userCategoryTwoCount,
      ExamTypeCount,
      AdminCount,
      monthlyUserAnalytics: chartData,
    };

    goodResponseDoc(res, 'Analysis ready', 200, analyticsData);
  } catch (error) {
    next(error);
  }
};
