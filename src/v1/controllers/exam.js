const Exam = require('../models/exam');
const Organization = require('../models/organization');

const {
  goodResponse,
  badResponse,
  goodResponseDoc,
} = require('../utils/response');
const mongoose = require('mongoose');
const { uploadImage } = require('../utils/image');

exports.createExam = async (req, res, next) => {
  try {
    console.log(req.body);
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
    let image = uploadImage(req);

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
      image = uploadImage(req);
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

    const exams = await Exam.find({ organization });
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
