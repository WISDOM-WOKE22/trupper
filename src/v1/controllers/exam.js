const Exam = require('../models/exam');
const {
  goodResponse,
  badResponse,
  goodResponseDoc,
} = require('../utils/response');
const mongoose = require('mongoose');

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
    } = req.body;
    if (!name)
      return badResponse(res, 'Provide a name for the exam to be created');
    if (!examType) return badResponse(res, 'Select an exam type');
    if (!duration) return badResponse(res, 'Select exam duration');
    // if (!category) return badResponse(res, 'Add exam  category');
    if (!acronym) return badResponse(res, 'Enter Exam acronym');
    if (!maxNoOfSubjects)
      return badResponse(
        res,
        'Enter the Max Number of subjects to be selected by a User'
      );
    if (!minNoOfSubjects)
      return badResponse(
        res,
        'Enter the Minimum Number of subjects to be selected by a User'
      );
    if (!subjectToBeWritten)
      return badResponse(
        res,
        'Enter the Number of subjects to be written by a User during an exam'
      );

    let image = '';

    await cloudinary.uploader
      .upload(req.file.path, { folder: 'uploads' })
      .then((result) => {
        image = result.secure_url;
      })
      .catch((err) => console.log(err));

    const exam = await Exam.create({
      name,
      examType,
      duration,
      acronym,
      status,
      noOfQuestions,
      maxNoOfSubjects,
      minNoOfSubjects,
      subjectToBeWritten,
      image,
      pastQuestion,
      school,
      scoreMultiplier,
      enableOptionE,
      questionYear,
    });

    goodResponseDoc(res, 'Exam created successfully', 201, exam);
  } catch (error) {
    if (error.code === 11000) {
      return badResponse(
        res,
        `An Exam with the name "${req.body.name}" or acronym "${req.body.acronym}" already exists`
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
      await cloudinary.uploader
        .upload(req.file.path, { folder: 'uploads' })
        .then((result) => {
          image = result.secure_url;
        })
        .catch((err) => console.log(err));
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
