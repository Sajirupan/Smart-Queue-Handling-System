const express = require('express');
const { generateToken, getActiveQueue } = require('../controllers/queueController');

const router = express.Router();

router.post('/generate', generateToken);
router.get('/active', getActiveQueue);

module.exports = router;
