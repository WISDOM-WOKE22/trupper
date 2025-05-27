const express = require('express')
const { 
    createExam,
    getExamsByOrganization,
    updateExam,
    getAnExam,
    deleteAnExam
 } = require("../controllers/exam");
const Router = express.Router();
const upload = require('../middlewares/multer')


Router.route('/').post(upload.single('image'),createExam);
Router.route('/organization/:organization').get(getExamsByOrganization);
Router.route('/:id').get(getAnExam).patch(updateExam).delete(deleteAnExam)


module.exports = Router;