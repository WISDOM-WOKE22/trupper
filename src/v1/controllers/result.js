const Result = require('../models/result');
const { badResponse, goodResponseDoc } = require('../utils/response');

// controllers/result.js
exports.getAUserResults = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id;

    // ── pagination ──────────────────────────────────────────
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const skip = (page - 1) * limit;

    // ── fetch docs + total count in parallel ───────────────
    const [rawDocs, totalDocs] = await Promise.all([
      Result.find({ user: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('exam') // keep if you need the exam object
        .lean(),
      Result.countDocuments({ user: user.id }),
    ]);

    // ── flatten "general" entries and keep only this user ──
    const merged = [];
    rawDocs.forEach((doc) => {
      if (String(doc.user) === userId) merged.push(doc);

      (doc.general || []).forEach((g) => {
        if (String(g.user) === userId) {
          merged.push({
            ...doc, // base fields
            ...g, // override with user‑specific result
            exam: doc.exam,
            isGeneralResult: true,
          });
        }
      });
    });

    // ── aggregate metrics in one pass ──────────────────────
    const stats = merged.reduce(
      (acc, r, _, arr) => {
        acc.totalQuestions += r.totalQuestions ?? 0;
        acc.totalAttempted += r.attempted ?? 0;
        acc.totalPassed += r.passed ?? 0;
        acc.totalFailed += r.failed ?? 0;
        acc.totalSkipped += r.skipped ?? 0;
        acc.averageScore +=
          r.score / (arr.length < 10 ? arr.length * 2 : arr.length);
        return acc;
      },
      {
        totalExams: merged.length,
        totalQuestions: 0,
        totalAttempted: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        averageScore: 0,
      }
    );

    // ── build pagination meta ──────────────────────────────
    const totalPages = Math.ceil(totalDocs / limit);

    const payload = {
      ...stats,
      data: merged,
      pagination: {
        page,
        limit,
        totalPages,
        totalDocs,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    };

    goodResponseDoc(res, 'Results fetched successfully', 200, payload);
  } catch (err) {
    next(err);
  }
};

exports.getAResult = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await Result.findById(id).populate('exam');
    console;

    if (!result) return badResponse(res, 'Result Does not exist');

    let doc;

    if (result && result.general.length > 1) {
      const gradeArray = result.general;

      const sortedGradeArray = gradeArray.sort((a, b) => b.score - a.score);
      doc = {
        shared: true,
        result,
        sortedGradeArray,
      };
    } else {
      doc = {
        result,
      };
    }

    goodResponseDoc(res, 'Result gotten successfully', 200, doc.result);
  } catch (error) {
    next(error);
  }
};
