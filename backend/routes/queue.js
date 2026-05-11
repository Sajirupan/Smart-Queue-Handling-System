const express = require('express');
const { generateToken, getActiveQueue, getCounterInfo } = require('../controllers/queueController');

const router = express.Router();

router.post('/generate', generateToken);
router.get('/active', getActiveQueue);
router.get('/counter/:id', getCounterInfo);

module.exports = router;
