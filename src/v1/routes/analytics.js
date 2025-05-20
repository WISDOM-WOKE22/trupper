const express = require('express');
const { getAnalytics } = require("../controllers/analytics");


const Router = express.Router();

Router.route("/organization/:id").get(getAnalytics);

module.exports = Router;
