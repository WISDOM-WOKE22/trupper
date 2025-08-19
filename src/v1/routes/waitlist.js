const express = require('express');
const router = express.Router();
const { addToWaitList } = require('../controllers/waitList');

router.post('/', addToWaitList);

module.exports = router;
