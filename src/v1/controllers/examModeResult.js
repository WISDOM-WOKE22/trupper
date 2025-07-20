const ExamModeResult = require('../models/examModeResult');
const { badResponse, goodResponseDoc } = require('../utils/response');

exports.getExamModeResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide exam mode result id');
    // Populate examModeCard, exam, and resultList.user
    const examModeResult = await ExamModeResult.findById(id)
      .populate('examModeCard')
      .populate('exam')
      .populate({
        path: 'resultList.user',
        model: 'User',
        select: 'firstName lastName email category subCategory', // add more fields as needed
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' },
        ],
      });

    if (!examModeResult) return badResponse(res, 'Exam mode result not found');

    // Calculate stats
    const resultList = examModeResult.resultList || [];
    const totalStudents = resultList.length;

    // Filter out results with valid scores for stats
    const scores = resultList
      .map((r) => (typeof r.score === 'number' ? r.score : null))
      .filter((score) => score !== null);

    let averageScore = null;
    let highestScore = null;
    let lowestScore = null;

    if (scores.length > 0) {
      const sum = scores.reduce((acc, curr) => acc + curr, 0);
      averageScore = sum / scores.length;
      highestScore = Math.max(...scores);
      lowestScore = Math.min(...scores);
    }

    // Calculate average school (most common school)
    let averageSchool = null;
    if (resultList.length > 0) {
      const schoolCount = {};
      resultList.forEach((r) => {
        if (r.school) {
          schoolCount[r.school] = (schoolCount[r.school] || 0) + 1;
        }
      });
      // Find the school with the highest count
      let maxCount = 0;
      Object.entries(schoolCount).forEach(([school, count]) => {
        if (count > maxCount) {
          maxCount = count;
          averageSchool = school;
        }
      });
    }

    const stats = {
      totalStudents,
      averageSchool,
      averageScore,
      highestScore,
      lowestScore,
    };

    goodResponseDoc(res, 'Exam mode result fetched successfully', 200, {
      ...examModeResult.toObject(),
      stats,
    });
  } catch (error) {
    next(error);
  }
};

exports.getExamModeResultByOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide organization id');
    const examModeResult = await ExamModeResult.find({ organization: id })
      .populate('examModeCard')
      .populate('exam');
    if (!examModeResult) return badResponse(res, 'Exam mode result not found');
    goodResponseDoc(
      res,
      'Exam mode result fetched successfully',
      200,
      examModeResult
    );
  } catch (error) {
    next(error);
  }
};
