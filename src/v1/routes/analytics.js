const express = require('express');
const { getAnalytics, getUserAnalysis } = require('../controllers/analytics');
const { protect } = require('../middlewares/protectRoute');
const User = require('../models/users');

const Router = express.Router();

Router.route('/organization/:id').get(getAnalytics);
Router.route('/user').get(protect(User), getUserAnalysis);

module.exports = Router;
