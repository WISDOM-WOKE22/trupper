const express = require('express');
const router = express.Router();
const { addToWaitList } = require('../controllers/waitList');

router.route('/').post(addToWaitList);

module.exports = router;
