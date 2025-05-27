const Exam = require('../models/exam');
const Subject = require('../models/subject');
const {
  badResponse,
  goodResponse,
  goodResponseDoc,
} = require('../utils/response');

exports.createSubject = async (req, res, next) => {
  try {
    const { name, exam, status, pastQuestion } = req.body;
    if (!name) return badResponse(res, 'Provide a name for this subject');
    if (!exam)
      return badResponse(
        res,
        'Select an exam to which this subject will belong to'
      );

    const examMain = await Exam.findOne({ _id: exam });
    if (!examMain) return badResponse(res, 'This exam selected does not exit');

    const subject = await Subject.create({
      name,
      exam: examMain._id,
      examType: examMain.examType,
      status,
      pastQuestion,
    });

    goodResponseDoc(res, 'Subject created successfully', 201, subject);
  } catch (error) {
    //   consoleError(error);
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Please provide subject query Id');
    const subject = await Subject.findByIdAndUpdate(id, req.body, {
      runValidators: false,
    });
     if (!subject) return badResponse(res, 'Subject not found');
    goodResponseDoc(res, 'Subject found', 200, subject);
  } catch (error) {
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try{
    const { id } = req.params;
    if (!id) return badResponse(res, 'Please provide subject query Id');
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return badResponse(res, 'Subject not found');
    goodResponse(res, "Subject Deleted Successfully")
  } catch(error){
    next(error)
  }
};

exports.getASubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return badResponse(res, 'Please provide subject query Id');
    const subject = await Subject.findById(id)
      .populate('exam')
      .populate('examType');
    if (!subject) return badResponse(res, 'Subject not found');
    goodResponseDoc(res, 'Subject found', 200, subject);
  } catch (error) {
    //   consoleError(error);
    next(error);
  }
};

exports.getSubjectsByExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) badResponse(res, 'Provide Exam ID');
    const subjects = await Subject.find({ exam: id });
    goodResponseDoc(res, 'SUbjects Gotten', 200, subjects);
  } catch (error) {
    next(error);
  }
};
