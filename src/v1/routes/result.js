const express = require('express');
const Router = express.Router();
const { getAResult, getAUserResults } = require('../controllers/result');
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');

Router.use(protect(User));

Router.route('/').get(getAUserResults);
Router.route('/:id').get(getAResult);

module.exports = Router;
