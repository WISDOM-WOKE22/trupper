const Exam = require('../models/exam');
const Organization = require('../models/organization');
const ExamCard = require('../models/examCard');
const {
  Types: { ObjectId },
} = require('mongoose');
const CategorySubject = require('../models/categorySubject');
const Questions = require('../models/questions');
const User = require('../models/users');
const Result = require('../models/result');
const {
  goodResponse,
  badResponse,
  goodResponseDoc,
} = require('../utils/response');
const mongoose = require('mongoose');
const { uploadImage } = require('../utils/image');
const ExamMode = require('../models/examMode');

exports.createExam = async (req, res, next) => {
  try {
    const {
      name,
      examType,
      duration,
      acronym,
      status,
      noOfQuestions,
      maxNoOfSubjects,
      minNoOfSubjects,
      subjectToBeWritten,
      pastQuestion,
      school,
      scoreMultiplier,
      enableOptionE,
      questionYear,
      organization,
    } = req.body;

    if (!name)
      return badResponse(res, 'Provide a name for the exam to be created');
    if (!examType) return badResponse(res, 'Select an exam type');
    if (!duration) return badResponse(res, 'Select exam duration');
    if (!acronym) return badResponse(res, 'Enter exam acronym');
    if (!maxNoOfSubjects)
      return badResponse(
        res,
        'Enter the max number of subjects to be selected by a user'
      );
    if (!minNoOfSubjects)
      return badResponse(
        res,
        'Enter the minimum number of subjects to be selected by a user'
      );
    if (!subjectToBeWritten)
      return badResponse(
        res,
        'Enter the number of subjects to be written by a user during an exam'
      );
    if (!noOfQuestions)
      return badResponse(res, 'Enter the number of questions per exam');
    if (!scoreMultiplier) return badResponse(res, 'Enter the score multiplier');
    if (!organization) return badResponse(res, 'Organization ID is required');

    // Parse string fields to appropriate types
    const parsedStatus = status === 'true'; // Convert string "true"/"false" to boolean
    const parsedNoOfQuestions = parseInt(noOfQuestions, 10);
    const parsedMaxNoOfSubjects = parseInt(maxNoOfSubjects, 10);
    const parsedMinNoOfSubjects = parseInt(minNoOfSubjects, 10);
    const parsedSubjectToBeWritten = parseInt(subjectToBeWritten, 10);
    const parsedScoreMultiplier = parseInt(scoreMultiplier, 10);

    // Validate numeric fields
    if (isNaN(parsedNoOfQuestions) || parsedNoOfQuestions < 1)
      return badResponse(
        res,
        'Number of questions must be a valid positive integer'
      );
    if (isNaN(parsedMaxNoOfSubjects) || parsedMaxNoOfSubjects < 1)
      return badResponse(
        res,
        'Max number of subjects must be a valid positive integer'
      );
    if (isNaN(parsedMinNoOfSubjects) || parsedMinNoOfSubjects < 1)
      return badResponse(
        res,
        'Min number of subjects must be a valid positive integer'
      );
    if (isNaN(parsedSubjectToBeWritten) || parsedSubjectToBeWritten < 1)
      return badResponse(
        res,
        'Number of subjects to be written must be a valid positive integer'
      );
    if (isNaN(parsedScoreMultiplier) || parsedScoreMultiplier < 1)
      return badResponse(
        res,
        'Score multiplier must be a valid positive integer'
      );
    if (parsedMinNoOfSubjects > parsedMaxNoOfSubjects)
      return badResponse(
        res,
        'Min number of subjects cannot be greater than max number of subjects'
      );

    // Handle image upload
    let image = await uploadImage(req, res);

    // Create exam in the database
    const exam = await Exam.create({
      name,
      examType,
      duration,
      acronym,
      status: parsedStatus,
      noOfQuestions: parsedNoOfQuestions,
      maxNoOfSubjects: parsedMaxNoOfSubjects,
      minNoOfSubjects: parsedMinNoOfSubjects,
      subjectToBeWritten: parsedSubjectToBeWritten,
      image,
      pastQuestion: pastQuestion || null,
      school: school || null,
      scoreMultiplier: parsedScoreMultiplier,
      enableOptionE: enableOptionE === 'true' || false,
      questionYear: questionYear || null,
      organization,
    });

    goodResponseDoc(res, 'Exam created successfully', 201, exam);
  } catch (error) {
    if (error.code === 11000) {
      return badResponse(
        res,
        `An exam with the name "${req.body.name}" or acronym "${req.body.acronym}" already exists`
      );
    }
    next(error);
  }
};

exports.updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide exam query ID');
    const {
      name,
      duration,
      acronym,
      status,
      noOfQuestions,
      maxNoOfSubjects,
      minNoOfSubjects,
      subjectToBeWritten,
      examType,
      pastQuestion,
      school,
      imageTest,
      scoreMultiplier,
      enableOptionE,
      questionYear,
    } = req.body;
    const examCheck = await Exam.find({ _id: id });
    let image = '';
    const examTypeObjectId = new mongoose.Types.ObjectId(examType);

    if (imageTest) {
      image = uploadImage(req, res);
    }

    const exam = await Exam.findOneAndUpdate(
      { _id: id },
      {
        name,
        examType: examTypeObjectId,
        duration,
        acronym,
        status,
        noOfQuestions,
        maxNoOfSubjects,
        minNoOfSubjects,
        subjectToBeWritten,
        pastQuestion,
        school,
        image: image ? image : examCheck.image,
        scoreMultiplier,
        enableOptionE,
        questionYear,
      },
      { runValidators: false, new: false }
    );

    if (!exam) return badResponse(res, 'Exam Does not exist');

    goodResponse(res, 'Exam Updated');
  } catch (error) {
    next(error);
  }
};

exports.getExamsByOrganization = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) return badResponse(res, 'Provide organization ID');

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const exams = await Exam.find({ organization }).populate({
      path: 'examType',
    });
    goodResponseDoc(res, 'Exams retrieved successfully', 200, exams);
  } catch (error) {
    next(error);
  }
};

exports.getExamsByExamType = async (req, res, next) => {
  try {
    const { examType } = req.params;
    // if (!organization) return badResponse(res, 'Provide organization ID');

    // const organizationCheck = await Organization.findById(organization);
    // if (!organizationCheck)
    //   return badResponse(res, 'Organization does not exist');

    const exams = await Exam.find({ examType }).populate({
      path: 'examType',
    });

    goodResponseDoc(res, 'Exams retrieved successfully', 200, exams);
  } catch (error) {
    next(error);
  }
};

exports.getExamsByOrganizationUser = async (req, res, next) => {
  try {
    const { organization } = req.params;
    if (!organization) return badResponse(res, 'Provide organization ID');

    const organizationCheck = await Organization.findById(organization);
    if (!organizationCheck)
      return badResponse(res, 'Organization does not exist');

    const exams = await Exam.find({ organization, status: true });
    goodResponseDoc(res, 'Exams retrieved successfully', 200, exams);
  } catch (error) {
    next(error);
  }
};

exports.getAnExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam ID');
    const exam = await Exam.findById(id).populate({ path: 'examType' });
    if (!exam) badResponse(res, 'Exam not found');
    goodResponseDoc(res, 'Exam retrieved successfully', 200, exam);
  } catch (error) {
    next(error);
  }
};

exports.deleteAnExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) badResponse(res, 'Provide Exam ID');
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) badResponse(res, 'Exam does not exist');
    goodResponse(res, 'Exam deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.startExamModeExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Provide Exam ID');
    const examMode = await ExamMode.findById(id);
    if (!examMode) return badResponse(res, 'Invalid exam mode');

    if (examMode.status === false)
      return badResponse(res, 'Exam mode is not active');

    const exam = await Exam.findById(examMode.exam);
  } catch (error) {
    next(error);
  }
};

exports.startAnExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { examCardID, examCardIdTwo, duration, examMode, organization } =
      req.body;
    const user = req.user;
    let questions = [];
    let result;
    let tm;

    // ***********************
    // Case 1: Using examCardID
    // ***********************
    if (examCardID) {
      const examCard = await ExamCard.findById(examCardID)
        .populate('exam')
        .populate('subjects')
        .populate('user');

      if (!examCard) return badResponse(res, 'Invalid ExamCard');
      if (examCard.exam.subjectToBeWritten < 1)
        return badResponse(res, 'Invalid ExamCard configuration');

      if (!examCard.user._id.equals(user._id))
        return badResponse(res, 'Unauthorized to start this exam');

      const examSubjects = examCard.subjects;
      const questionPromises = examSubjects.map(async (subject) => {
        const matchFilter = {
          subject: new ObjectId(subject.subject),
        };

        const sampleSize = Math.floor(
          examCard.exam.noOfQuestions / examSubjects.length
        );
        return await Questions.aggregate([
          { $match: matchFilter },
          { $sample: { size: sampleSize } },
          {
            $lookup: {
              from: 'subjects',
              localField: 'subject',
              foreignField: '_id',
              as: 'subject',
            },
          },
          { $unwind: '$subject' },
        ]);
      });

      const questionsArrays = await Promise.all(questionPromises);
      questions = questionsArrays.flat();

      if (!questions.length)
        return badResponse(res, 'No questions available for this exam');

      tm = duration || examCard.exam.duration;

      // result = await Result.findOne({
      //   user: user._id,
      //   subscription: examCard._id,
      // });

      // if (result && result.finished)
      //   return badResponse(res, "Oops, you can't re-write this exam");

      if (!result) {
        result = await Result.create({
          user: user._id,
          exam: examCard.exam._id,
          subject: examCard.exam.acronym,
          duration: tm,
          subscription: examCard._id,
          totalQuestions: examCard.exam.noOfQuestions,
          score: 0,
        });
      }

      user.examOngoing = true;
      user.examResultId = result._id;
      user.examState = {
        questions,
        duration: tm,
        subject: examCard.exam.acronym,
      };

      user.examOngoing = true;
      user.examResultId = result._id;
      await user.save({ runValidators: false, validateBeforeSave: false });

      const userData = await User.findById(user.id);

      return goodResponseDoc(res, 'Exam Started', 201, {
        questions,
        duration: tm,
        subject: examCard.exam.acronym,
        resultId: result._id,
        user: userData,
      });
    }

    // ***********************
    // Case 2: Using id and examCardIdTwo (non-subscription exam)
    // ***********************
    if (!id) return badResponse(res, 'Provide Category Subject id');

    const examSubject = await CategorySubject.findById(id).populate('exam');
    if (!examSubject) return badResponse(res, 'Invalid id');

    const examCard = await ExamCard.findById(examCardIdTwo)
      .populate('exam')
      .populate('subjects')
      .populate('user');

    // if (!examCard.user._id.equals(user._id))
    //   return badResponse(res, 'Unauthorized to start this exam');

    const matchFilter = { subject: new ObjectId(examSubject.subject) };

    questions = await Questions.aggregate([
      { $match: matchFilter },
      { $sample: { size: examSubject.exam.noOfQuestions } },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
    ]);

    if (!questions.length)
      return badResponse(res, 'No questions available for this exam');

    tm = duration || examSubject.exam.duration;

    result = await Result.create({
      user: user._id,
      exam: examSubject.exam._id,
      subject: examSubject.name,
      duration: tm,
      totalQuestions: examSubject.exam.noOfQuestions,
      score: 0,
    });

    user.examOngoing = true;
    user.examResultId = result._id;
    await user.save({ runValidators: false, validateBeforeSave: false });
    const userData = await User.findById(user.id);

    return goodResponseDoc(res, 'Exam Started', 201, {
      questions,
      duration: tm,
      subject: examSubject.name,
      resultId: result._id,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

exports.endExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Result ID is required');

    const {
      score,
      failed,
      passed,
      skipped,
      attempted,
      totalQuestions,
      timeLeft,
    } = req.body;

    const user = req.user;

    const result = await Result.findById(id)
      .populate('user')
      .populate('subscription')
      .populate('exam');

    if (!result) return badResponse(res, 'Result does not exist');

    // Ensure the current user is the owner of the result
    if (result.user._id.toString() !== user._id.toString()) {
      return badResponse(res, 'Unauthorized: You cannot end this exam');
    }

    // Calculate finish time
    let finishTime = 0;
    if (result.exam) {
      finishTime = Number(result.exam.duration) - Number(timeLeft) / 60;
    }

    // Update user level
    user.level = Number(user.level) + Number(score) / 50;
    await user.save({ validateBeforeSave: false, runValidators: false });

    // Update result document
    result.score = score;
    result.failed = failed;
    result.passed = passed;
    result.finished = true;
    result.skipped = skipped;
    result.attempted = attempted;
    result.totalQuestions = totalQuestions;
    result.finishTime = finishTime;

    user.examOngoing = true;
    user.examResultId = result._id;
    user.examState = undefined;

    await user.save({ validateBeforeSave: false, runValidators: false });
    await result.save({ validateBeforeSave: false, runValidators: false });

    return goodResponseDoc(res, 'Exam ended', 200, { result });
  } catch (error) {
    next(error);
  }
};
